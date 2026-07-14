from django.db import models
from websites.models import TimeStampedModel
from websites.models import Website


class ShopifyStore(models.Model):
    """
    One-to-one with Website. A Website becomes a "connected Shopify store"
    once OAuth succeeds and this row is created.

    We keep this SEPARATE from Website (rather than adding fields to Website)
    because these fields are meaningless for any non-Shopify platform —
    a WooCommerce or custom-site Website will simply have no ShopifyStore
    attached at all, instead of a bunch of null Shopify-only columns.
    """
    website = models.OneToOneField(
        Website,
        on_delete=models.CASCADE,
        related_name='shopify_store'
    )
    shop_domain = models.CharField(
        max_length=255,
        unique=True,
        help_text="e.g. my-store.myshopify.com"
    )
    access_token = models.CharField(max_length=255)
    scope = models.CharField(
        max_length=500,
        blank=True,
        help_text="Comma-separated permissions granted during OAuth, e.g. read_products"
    )
    connected_at = models.DateTimeField(auto_now_add=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.shop_domain


class Product(TimeStampedModel):
    """
    Structured product data pulled from Shopify's Admin API.
    Deliberately rich (not just title/description) so the AI has
    real structured fields to reason over (price, availability, etc.)
    instead of guessing from scraped text.
    """
    store = models.ForeignKey(
        ShopifyStore,
        on_delete=models.CASCADE,
        related_name='products'
    )
    shopify_product_id = models.CharField(max_length=50, db_index=True)
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    handle = models.SlugField(max_length=500)  # Shopify's URL slug
    vendor = models.CharField(max_length=255, blank=True)
    product_type = models.CharField(max_length=255, blank=True)
    tags = models.TextField(blank=True)  # comma-separated, matches Shopify's format

    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    image_url = models.URLField(max_length=1000, blank=True)
    product_url = models.URLField(max_length=1000, blank=True)

    inventory_quantity = models.IntegerField(null=True, blank=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ('store', 'shopify_product_id')

    def __str__(self):
        return self.title

# Create your models here.
