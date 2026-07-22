import os
import re
import cohere
from integrations.models import Product

client = cohere.Client(api_key=os.getenv('COHERE_API_KEY'))

MAX_PRODUCTS_IN_RESPONSE = 4

GREETING_PATTERN = re.compile(
    r'^\s*(hi|hey|hello|yo|sup|good\s*(morning|afternoon|evening)|howdy)[\s!.,?]*$',
    re.IGNORECASE
)


def is_greeting(query):
    return bool(GREETING_PATTERN.match(query.strip()))


def resolve_query(question, history_messages):
    """
    Rewrites `question` into a standalone query using recent conversation
    history, so pronoun/ellipsis follow-ups like "pictures of them" or
    "does it come in blue" retrieve correctly instead of failing search
    on their own.

    history_messages: list of {'role': 'customer'|'assistant', 'content': str},
    oldest first, NOT including the current `question` itself. Pass [] (or
    the first message of a session) to skip the rewrite entirely.

    This is intentionally a separate, cheap Cohere call — it does NOT touch
    generate_response's own call. If it fails for any reason, we fall back
    to the original question rather than blocking the chat.
    """
    if not history_messages:
        return question

    transcript = "\n".join(
        f"{'Customer' if m['role'] == 'customer' else 'Assistant'}: {m['content']}"
        for m in history_messages
    )

    system_prompt = """You rewrite a customer's latest chat message into a standalone question.
Resolve pronouns and references (e.g. "them", "it", "that one", "the cheaper one") using the
conversation history below, so the rewritten question makes full sense with NO prior context.

The conversation is ordered oldest to newest. When resolving a pronoun or reference, always
prefer the MOST RECENT relevant turn — do not reach back past a more recent message that
changed the subject. If the most recent turn doesn't give enough information to resolve the
reference confidently, leave the ambiguous wording as-is rather than guessing based on older,
no-longer-relevant context.

If the message is already standalone, return it unchanged.
Respond with ONLY the rewritten question — no preamble, no quotes, no explanation."""

    user_message = f"""CONVERSATION SO FAR:
{transcript}

LATEST CUSTOMER MESSAGE:
{question}"""

    try:
        response = client.chat(
            model='command-a-03-2025',
            preamble=system_prompt,
            message=user_message,
            temperature=0
        )
        rewritten = response.text.strip()
        return rewritten if rewritten else question
    except Exception as e:
        print(f"Cohere query-rewrite error: {e}")
        return question


def get_structured_products(relevant_chunks):
    """
    relevant_chunks: list of dicts from search_knowledge_base(), already
    filtered by min_similarity and sorted by similarity descending.

    Returns (structured, capped_ids):
      - structured: list of structured product dicts, ordered by highest
        matching similarity, capped at MAX_PRODUCTS_IN_RESPONSE.
      - capped_ids: the same product ids, in the same order, as plain ids
        (not dicts) — so callers can align other logic (like the chunks
        fed to the LLM) to this exact same product set instead of
        re-deriving their own selection and risking drift.

    Returns ([], []) if the top chunk isn't product-sourced.
    """
    if not relevant_chunks:
        return [], []

    if relevant_chunks[0]['source_type'] != 'product':
        return [], []

    seen = set()
    ordered_product_ids = []
    for chunk in relevant_chunks:
        if chunk['source_type'] != 'product':
            continue
        pid = chunk['product_id']
        if pid not in seen:
            seen.add(pid)
            ordered_product_ids.append(pid)

    capped_ids = ordered_product_ids[:MAX_PRODUCTS_IN_RESPONSE]

    products_qs = Product.objects.filter(id__in=capped_ids)
    products_by_id = {p.id: p for p in products_qs}

    structured = []
    for pid in capped_ids:
        product = products_by_id.get(pid)
        if product is None:
            continue
        structured.append({
            'title': product.title,
            'price': str(product.price),
            'compare_at_price': str(product.compare_at_price) if product.compare_at_price else None,
            'image_url': product.image_url,
            'product_url': product.product_url,
            'is_available': product.is_available,
        })

    return structured, capped_ids


def generate_response(query, relevant_chunks, top_raw_similarity=0, off_topic_threshold=0.22):

    if is_greeting(query):
        return {
            'answer': "Hi there! 👋 How can I help you today? Feel free to ask me anything about our products, shipping, or store policies.",
            'confidence': 1.0,
            'sources': [],
            'products': [],
            'needs_human': False
        }

    if not relevant_chunks:
        if top_raw_similarity < off_topic_threshold:
            # Genuinely unrelated to this store (weather, poems, etc.)
            # Decline politely — no human agent, no ticket.
            return {
                'answer': "I'm not able to help with that — I can only answer questions about our products and store policies. Is there something about our store I can help with?",
                'confidence': top_raw_similarity,
                'sources': [],
                'products': [],
                'needs_human': False
            }

        # Related to the store, but we don't have the info. Worth a human follow-up.
        return {
            'answer': "I'm sorry, I couldn't find that information. Let me connect you with a member of our team who can help further.",
            'confidence': top_raw_similarity,
            'sources': [],
            'products': [],
            'needs_human': True
        }

    # Compute products up front — needed for both the returned payload and
    # (below) to make sure the LLM's context stays aligned to the same
    # product set shown in the widget's cards.
    structured_products, capped_ids = get_structured_products(relevant_chunks)

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
            'products': [],
            'needs_human': True
        }

    confidence = relevant_chunks[0]['similarity']

    return {
        'answer': answer,
        'confidence': confidence,
        'sources': sources,
        'products': structured_products,
        'needs_human': confidence < 0.35
    }