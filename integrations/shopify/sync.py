from websites.models import KnowledgeChunk
from websites.chunker import chunk_text
from websites.embedder import embed_text
from .shopify_client import fetch_products
from ..models import Product


def run_product_sync(shopify_store, job):
    try:
        products_data = fetch_products(shopify_store.shop_domain, shopify_store.access_token)
        print(f"Products found: {len(products_data)}")

        job.pages_total = len(products_data)
        job.save()

        for i, p in enumerate(products_data):
            try:
                product, _ = Product.objects.update_or_create(
                    store=shopify_store,
                    shopify_product_id=p['id'],
                    defaults={
                        'title': p['title'],
                        'description': p.get('description', ''),
                        'handle': p['handle'],
                        'vendor': p.get('vendor', ''),
                        'product_type': p.get('product_type', ''),
                        'tags': p.get('tags', ''),
                        'price': p['price'],
                        'compare_at_price': p.get('compare_at_price'),
                        'image_url': p.get('image_url', ''),
                        'product_url': p.get('product_url', ''),
                        'inventory_quantity': p.get('inventory_quantity'),
                        'is_available': p.get('is_available', True),
                    }
                )
                print(f"Saved product {i+1}: {product.title}")

                # Build a text blob and chunk+embed it
                blob = f"{product.title}\n{product.description}\nVendor: {product.vendor}\nType: {product.product_type}\nTags: {product.tags}\nPrice: {product.price}"
                chunks = chunk_text(blob)

                for idx, chunk_content in enumerate(chunks):
                    try:
                        embedding = embed_text(chunk_content)
                        KnowledgeChunk.objects.create(
                            product=product,
                            merchant=shopify_store.website.merchant,
                            content=chunk_content,
                            embedding=embedding,
                            chunk_index=idx,
                            source_type='product'
                        )
                    except Exception as e:
                        print(f"Error embedding product chunk: {e}")

            except Exception as e:
                print(f"Error saving product {i+1}: {e}")

            job.pages_done = i + 1
            job.save()

        job.status = 'completed'
        job.chunks_created = KnowledgeChunk.objects.filter(product__store=shopify_store).count()
        job.save()

        from django.utils import timezone
        shopify_store.last_synced_at = timezone.now()
        shopify_store.save()

        print("Product sync complete.")

    except Exception as e:
        print(f"Product sync failed: {e}")
        job.status = 'failed'
        job.error_message = str(e)
        job.save()