import uuid
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Website(TimeStampedModel):

    class Platform(models.TextChoices):
        SHOPIFY = 'shopify', 'Shopify'
        WORDPRESS = 'wordpress', 'WordPress'
        WEBFLOW = 'webflow', 'Webflow'
        CUSTOM = 'custom', 'Custom'

    class WebsiteStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SCRAPING = 'scraping', 'Scraping'
        READY = 'ready', 'Ready'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    merchant = models.ForeignKey(
        'accounts.Merchant',
        on_delete=models.CASCADE,
        related_name='websites'
    )
    url = models.URLField()
    platform = models.CharField(
        max_length=20,
        choices=Platform.choices,
        default=Platform.SHOPIFY
    )
    access_token = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=20,
        choices=WebsiteStatus.choices,
        default=WebsiteStatus.PENDING
    )
    last_scraped = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['merchant', 'url'],
                name='unique_merchant_website'
            )
        ]

    def __str__(self):
        return self.url


class CrawledPage(TimeStampedModel):

    class PageType(models.TextChoices):
        FAQ = 'faq', 'FAQ'
        ABOUT = 'about', 'About'
        SHIPPING = 'shipping', 'Shipping'
        CONTACT = 'contact', 'Contact'
        PRODUCT = 'product', 'Product'
        BLOG = 'blog', 'Blog'
        OTHER = 'other', 'Other'

    class PageStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CRAWLED = 'crawled', 'Crawled'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    website = models.ForeignKey(
        'websites.Website',
        on_delete=models.CASCADE,
        related_name='pages'
    )
    url = models.URLField()
    title = models.CharField(max_length=255)
    html = models.TextField()
    clean_text = models.TextField()
    page_type = models.CharField(
        max_length=20,
        choices=PageType.choices,
        default=PageType.OTHER
    )
    http_status = models.IntegerField(null=True, blank=True)
    content_hash = models.CharField(max_length=64, blank=True)
    status = models.CharField(
        max_length=20,
        choices=PageStatus.choices,
        default=PageStatus.PENDING
    )
    last_crawled = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title


class EmbeddingJob(TimeStampedModel):

    class JobStatus(models.TextChoices):
        QUEUED = 'queued', 'Queued'
        RUNNING = 'running', 'Running'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    website = models.ForeignKey(
        'websites.Website',
        on_delete=models.CASCADE,
        related_name='embedding_jobs'
    )
    status = models.CharField(
        max_length=20,
        choices=JobStatus.choices,
        default=JobStatus.QUEUED
    )
    pages_total = models.IntegerField(default=0)
    pages_done = models.IntegerField(default=0)
    chunks_created = models.IntegerField(default=0)
    error_message = models.TextField(null=True, blank=True)
    duration_seconds = models.IntegerField(null=True, blank=True)
    retry_count = models.IntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.website} - {self.status}"
    
class KnowledgeChunk(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(
        'websites.CrawledPage',
        on_delete=models.CASCADE,
        related_name='chunks',
        null=True, blank=True          # CHANGED
    )
    product = models.ForeignKey(       # NEW
        'integrations.Product',
        on_delete=models.CASCADE,
        related_name='chunks',
        null=True, blank=True
    )
    merchant = models.ForeignKey(
        'accounts.Merchant',
        on_delete=models.CASCADE,
        related_name='chunks'
    )
    source_type = models.CharField(max_length=50, blank=True)
    content = models.TextField()
    embedding = models.JSONField(null=True, blank=True)
    chunk_index = models.IntegerField(default=0)

    def __str__(self):
        label = self.page.title if self.page_id else (self.product.title if self.product_id else 'unknown')
        return f"Chunk {self.chunk_index} - {label}"

    def get_source(self):
        if self.source_type == 'product' and self.product_id:
            return {'title': self.product.title, 'url': self.product.product_url, 'type': 'product'}
        if self.page_id:
            return {'title': self.page.title, 'url': self.page.url, 'type': 'page'}
        return {'title': None, 'url': None, 'type': self.source_type or 'unknown'}