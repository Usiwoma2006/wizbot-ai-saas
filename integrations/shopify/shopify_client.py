# integrations/shopify/shopify_client.py
import requests

SHOPIFY_API_VERSION = '2026-07'

PRODUCTS_QUERY = """
query GetProducts($cursor: String) {
  products(first: 50, after: $cursor) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        title
        description
        handle
        vendor
        productType
        tags
        status
        onlineStoreUrl
        totalInventory
        priceRangeV2 {
          minVariantPrice {
            amount
          }
        }
        compareAtPriceRange {
          minVariantCompareAtPrice {
            amount
          }
        }
        images(first: 1) {
          edges {
            node {
              url
            }
          }
        }
      }
    }
  }
}
"""


def fetch_products(shop_domain, access_token):
    """
    Fetches ALL products from a Shopify store via GraphQL, handling
    cursor-based pagination automatically. Returns a list of dicts
    shaped to match integrations.models.Product's fields directly.
    """
    url = f"https://{shop_domain}/admin/api/{SHOPIFY_API_VERSION}/graphql.json"
    headers = {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': access_token,
    }

    all_products = []
    cursor = None
    has_next_page = True

    while has_next_page:
        response = requests.post(
            url,
            json={'query': PRODUCTS_QUERY, 'variables': {'cursor': cursor}},
            headers=headers,
            timeout=15
        )
        response.raise_for_status()
        data = response.json()

        if 'errors' in data:
            raise Exception(f"Shopify GraphQL error: {data['errors']}")

        products_data = data['data']['products']

        for edge in products_data['edges']:
            node = edge['node']

            images = (node.get('images') or {}).get('edges', [])
            image_url = images[0]['node']['url'] if images else ''

            price_range = node.get('priceRangeV2') or {}
            price_info = price_range.get('minVariantPrice') or {}
            price = price_info.get('amount', '0.00')

            compare_range = node.get('compareAtPriceRange') or {}
            compare_info = compare_range.get('minVariantCompareAtPrice')
            compare_at_price = compare_info.get('amount') if compare_info else None

            shopify_id = node['id'].split('/')[-1]

            all_products.append({
                'id': shopify_id,
                'title': node['title'],
                'description': node.get('description', ''),
                'handle': node['handle'],
                'vendor': node.get('vendor', ''),
                'product_type': node.get('productType', ''),
                'tags': ', '.join(node.get('tags', [])),
                'price': price,
                'compare_at_price': compare_at_price,
                'image_url': image_url,
                'product_url': node.get('onlineStoreUrl') or '',
                'inventory_quantity': node.get('totalInventory'),
                'is_available': node.get('status') == 'ACTIVE',
            })

        page_info = products_data['pageInfo']
        has_next_page = page_info['hasNextPage']
        cursor = page_info['endCursor']

    return all_products