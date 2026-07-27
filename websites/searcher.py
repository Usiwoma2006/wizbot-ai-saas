import os
import cohere
import math

client = cohere.Client(api_key=os.getenv('COHERE_API_KEY'))


def embed_query(query):
    """
    Embeds a customer question.
    Uses input_type='search_query' instead of 'search_document'.
    """
    response = client.embed(
        texts=[query],
        model='embed-english-v3.0',
        input_type='search_query'
    )
    return response.embeddings[0]


def cosine_similarity(vec1, vec2):
    """
    Calculates how similar two vectors are.
    Returns a number between 0 and 1.
    1 means identical, 0 means completely different.
    """
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude1 = math.sqrt(sum(a * a for a in vec1))
    magnitude2 = math.sqrt(sum(b * b for b in vec2))

    if magnitude1 == 0 or magnitude2 == 0:
        return 0

    return dot_product / (magnitude1 * magnitude2)


def search_knowledge_base(query, merchant, top_k=5, min_similarity=0.3):
    """
    Searches the merchant's knowledge base for the most relevant chunks.

    Returns a tuple: (filtered_results, top_raw_similarity)
    - filtered_results: up to top_k chunks that meet min_similarity, used
      to build the Cohere prompt context.
    - top_raw_similarity: the single best similarity score found BEFORE
      filtering, even if nothing met the bar.
    """
    from websites.models import KnowledgeChunk

    query_embedding = embed_query(query)

    chunks = KnowledgeChunk.objects.filter(
        merchant=merchant
    ).select_related('page', 'product', 'custom_article')

    results = []

    for chunk in chunks:
        if not chunk.embedding:
            continue

        similarity = cosine_similarity(query_embedding, chunk.embedding)

        source = chunk.get_source()

        results.append({
            'content': chunk.content,
            'url': source['url'],
            'title': source['title'],
            'source_type': source['type'],
            'product_id' : chunk.product_id,
            'similarity': similarity
        })

    results.sort(key=lambda x: x['similarity'], reverse=True)

    top_raw_similarity = results[0]['similarity'] if results else 0

    filtered = [r for r in results if r['similarity'] >= min_similarity]

    return filtered[:top_k], top_raw_similarity