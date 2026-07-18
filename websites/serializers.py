from rest_framework import serializers
from .models import Website, KnowledgeChunk, CrawledPage
import requests


class CrawledPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrawledPage
        fields = ['id', 'url', 'title', 'status', 'http_status']


class WebsiteSerializer(serializers.ModelSerializer):
    pages_count = serializers.SerializerMethodField()
    chunks_count = serializers.SerializerMethodField()
    crawled_pages = CrawledPageSerializer(many=True, read_only=True, source='pages')

    class Meta:
        model = Website
        fields = [
            'id', 'url', 'platform', 'access_token', 'status', 'last_scraped', 'created_at',
            'pages_count', 'chunks_count', 'crawled_pages',
        ]
        read_only_fields = ['id', 'status', 'last_scraped', 'created_at', 'pages_count', 'chunks_count', 'crawled_pages']

    def get_pages_count(self, obj):
        return obj.pages.count()

    def get_chunks_count(self, obj):
        # KnowledgeChunk links to merchant directly, not to Website, so we
        # go through both possible source relations: page-sourced chunks
        # (website scraping) AND product-sourced chunks (Shopify sync).
        # Using page__website OR product__website covers both source_types.
        return KnowledgeChunk.objects.filter(page__website=obj).count() + \
               KnowledgeChunk.objects.filter(product__store__website=obj).count()

    def validate_url(self, value):
        try:
            response = requests.get(value, timeout=10)
            if response.status_code >= 400:
                raise serializers.ValidationError(
                    "This website could not be reached. Please check the URL and try again."
                )
        except requests.exceptions.ConnectionError:
            raise serializers.ValidationError(
                "Could not connect to this website. Please check the URL and try again."
            )
        except requests.exceptions.Timeout:
            raise serializers.ValidationError(
                "The website took too long to respond. Please try again."
            )
        except requests.exceptions.RequestException:
            raise serializers.ValidationError(
                "Something went wrong while checking this URL. Please try again."
            )
        return value