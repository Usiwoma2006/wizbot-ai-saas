import os
import cohere

client = cohere.Client(api_key=os.getenv('COHERE_API_KEY'))


def embed_text(text):
    """
    Takes a string of text and returns a vector embedding.
    """
    response = client.embed(
        texts=[text],
        model='embed-english-v3.0',
        input_type='search_document'
    )
    return response.embeddings[0]


def embed_chunks(chunks):
    """
    Takes a list of chunk dicts and adds an embedding to each one.
    Returns the same list with embeddings added.
    """
    embedded = []

    for chunk in chunks:
        try:
            embedding = embed_text(chunk['content'])
            chunk['embedding'] = embedding
            embedded.append(chunk)
            print(f"Embedded chunk {chunk['chunk_index']} from {chunk['title']}")
        except Exception as e:
            print(f"Failed to embed chunk: {e}")
            continue

    return embedded