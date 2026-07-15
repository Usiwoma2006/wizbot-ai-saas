def chunk_text(text, chunk_size=500, overlap=100):
    """
    Splits text into overlapping chunks.
    
    chunk_size: number of words per chunk
    overlap: number of words shared between consecutive chunks
    """
    if not text or not text.strip():
        return []

    words = text.split()
    
    if len(words) <= chunk_size:
        return [text]

    chunks = []
    start = 0

    while start < len(words):
        end = start + chunk_size
        chunk = ' '.join(words[start:end])
        chunks.append(chunk)
        
        if end >= len(words):
            break
            
        start = end - overlap

    return chunks


def chunk_pages(pages):
    """
    Takes a list of CrawledPage objects and returns
    a list of dicts ready to be embedded.
    """
    all_chunks = []

    for page in pages:
        if not page.clean_text:
            continue

        chunks = chunk_text(page.clean_text)

        for i, chunk in enumerate(chunks):
            all_chunks.append({
                'page_id': str(page.id),
                'url': page.url,
                'title': page.title,
                'content': chunk,
                'chunk_index': i,
                'source_type': 'page',
            })

    return all_chunks