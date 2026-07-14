import os
import cohere

client = cohere.Client(api_key=os.getenv('COHERE_API_KEY'))


def generate_response(query, relevant_chunks, top_raw_similarity=0, off_topic_threshold=0.22):

    if not relevant_chunks:
        if top_raw_similarity < off_topic_threshold:
            # Genuinely unrelated to this store (weather, poems, etc.)
            # Decline politely — no human agent, no ticket.
            return {
                'answer': "I'm not able to help with that — I can only answer questions about our products and store policies. Is there something about our store I can help with?",
                'confidence': top_raw_similarity,
                'sources': [],
                'needs_human': False
            }

        # Related to the store, but we don't have the info. Worth a human follow-up.
        return {
            'answer': "I'm sorry, I couldn't find that information. Let me connect you with a member of our team who can help further.",
            'confidence': top_raw_similarity,
            'sources': [],
            'needs_human': True
        }

    context = ""
    sources = []
    seen_pages = set()

    for i, chunk in enumerate(relevant_chunks):
        context += f"\n\nSource {i+1} ({chunk['title']}):\n{chunk['content']}"

        page_key = chunk['url']
        if page_key not in seen_pages:
            seen_pages.add(page_key)
            sources.append({
                'title': chunk['title'],
                'url': chunk['url'],
                'similarity': round(chunk['similarity'], 3)
            })

    system_prompt = """You are a helpful customer service assistant for an online store.
Answer the customer's question using ONLY the information provided in SOURCES.
If you can answer the question, even partially, give a direct, confident answer and do NOT mention a human agent or say you are unsure.
Only say you'll connect them with a human agent if the SOURCES contain NOTHING relevant to the question at all.
Keep your answer concise, friendly, and helpful."""

    user_message = f"""SOURCES:
{context}

CUSTOMER QUESTION:
{query}"""

    try:
        response = client.chat(
            model='command-a-03-2025',
            preamble=system_prompt,
            message=user_message,
            temperature=0.3
        )
        answer = response.text.strip()

    except Exception as e:
        print(f"Cohere error: {e}")
        return {
            'answer': "I'm having trouble finding that information right now. Let me connect you with our team.",
            'confidence': 0,
            'sources': [],
            'needs_human': True
        }

    confidence = relevant_chunks[0]['similarity']

    return {
        'answer': answer,
        'confidence': confidence,
        'sources': sources,
        'needs_human': confidence < 0.35
    }