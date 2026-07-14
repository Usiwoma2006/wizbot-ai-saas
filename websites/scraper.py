import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse


def fetch_page(url):
    """
    Fetches a single page and returns the HTML content.
    Returns None if the page cannot be reached.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; WizBot/1.0)'
        }
        response = requests.get(url, timeout=10, headers=headers)
        if response.status_code == 200:
            return response.text
        return None
    except Exception:
        return None


def extract_clean_text(html):
    """
    Takes raw HTML and returns clean readable text.
    Removes scripts, styles, and navigation noise.
    """
    soup = BeautifulSoup(html, 'html.parser')

    # Remove elements that are not useful content
    for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
        tag.decompose()

    # Get the page title
    title = soup.title.string.strip() if soup.title else 'No Title'

    # Extract clean text
    text = soup.get_text(separator=' ', strip=True)

    # Remove excessive whitespace
    clean = ' '.join(text.split())

    return title, clean


def extract_internal_links(html, base_url):
    """
    Finds all internal links on a page.
    Returns a list of absolute URLs that belong to the same domain.
    """
    soup = BeautifulSoup(html, 'html.parser')
    base_domain = urlparse(base_url).netloc
    links = set()

    for anchor in soup.find_all('a', href=True):
        href = anchor['href']
        full_url = urljoin(base_url, href)
        parsed = urlparse(full_url)

        # Only keep links from the same domain
        if parsed.netloc == base_domain and parsed.scheme in ['http', 'https']:
            # Remove fragments and query strings for cleanliness
            clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
            links.add(clean_url)

    return list(links)


def scrape_website(url, max_pages=50):
    """
    Crawls a website starting from the given URL.
    Returns a list of dicts containing page data.
    Stops after max_pages to avoid infinite crawling.
    """
    visited = set()
    to_visit = [url]
    pages = []

    while to_visit and len(visited) < max_pages:
        current_url = to_visit.pop(0)

        if current_url in visited:
            continue

        visited.add(current_url)

        html = fetch_page(current_url)
        if not html:
            continue

        title, clean_text = extract_clean_text(html)

        pages.append({
            'url': current_url,
            'title': title,
            'html': html,
            'clean_text': clean_text,
            'http_status': 200
        })

        # Find more pages to crawl
        internal_links = extract_internal_links(html, url)
        for link in internal_links:
            if link not in visited:
                to_visit.append(link)

    return pages