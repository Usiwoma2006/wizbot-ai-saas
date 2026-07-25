import os
import cohere

client = cohere.Client(api_key=os.getenv('COHERE_API_KEY'))

# Cohere's embed endpoint accepts up to 96 texts per call.
# Batching drastically cuts down round-trip API calls vs one-at-a-time.
BATCH_SIZE = 90


def embed_text(text):
    """
    Takes a single string of text and returns a vector embedding.
    Kept for any code that still needs to embed one string at a time
    (e.g. embedding a customer's live chat query during search).
    """
    response = client.embed(
        texts=[text],
        model='embed-english-v3.0',
        input_type='search_document'
    )
    return response.embeddings[0]

def embed_and_store_custom_article(article):
    """
    Chunks and embeds a CustomArticle's content, saving results as
    KnowledgeChunk rows. Meant to run via async_task (Django-Q2), not
    synchronously in the request/response cycle.
    """
    from websites.chunker import chunk_text
    from websites.models import KnowledgeChunk

    article.status = 'embedding'
    article.save()

    try:
        chunks = chunk_text(article.content)

        for i, chunk_content in enumerate(chunks):
            embedding = embed_text(chunk_content)
            KnowledgeChunk.objects.create(
                custom_article=article,
                merchant=article.merchant,
                content=chunk_content,
                embedding=embedding,
                chunk_index=i,
                source_type='custom'
            )

        article.status = 'synced'
        article.save()

    except Exception as e:
        article.status = 'failed'
        article.error_message = str(e)
        article.save()


def embed_chunks(chunks):
    """
    Takes a list of chunk dicts and adds an embedding to each one.
    Sends chunks to Cohere in batches of BATCH_SIZE instead of one
    request per chunk — same result, far fewer API round-trips.
    Returns the same list with embeddings added (chunks that fail
    are skipped, same as before).
    """
    embedded = []

    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i:i + BATCH_SIZE]
        texts = [chunk['content'] for chunk in batch]

        try:
            response = client.embed(
                texts=texts,
                model='embed-english-v3.0',
                input_type='search_document'
            )

            for chunk, embedding in zip(batch, response.embeddings):
                chunk['embedding'] = embedding
                embedded.append(chunk)
                print(f"Embedded chunk {chunk['chunk_index']} from {chunk['title']}")

        except Exception as e:
            # If a whole batch fails, fall back to embedding that batch's
            # chunks one at a time so a single bad chunk doesn't sink the
            # other ~90 chunks that were fine.
            print(f"Batch embedding failed, falling back to individual calls: {e}")
            for chunk in batch:
                try:
                    embedding = embed_text(chunk['content'])
                    chunk['embedding'] = embedding
                    embedded.append(chunk)
                    print(f"Embedded chunk {chunk['chunk_index']} from {chunk['title']}")
                except Exception as inner_e:
                    print(f"Failed to embed chunk: {inner_e}")
                    continue

    return embedded

