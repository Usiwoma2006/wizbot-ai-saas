from rest_framework import serializers
from .models import Website, KnowledgeChunk
import requests


class WebsiteSerializer(serializers.ModelSerializer):
    pages_count = serializers.SerializerMethodField()
    chunks_count = serializers.SerializerMethodField()

    class Meta:
        model = Website
        fields = [
            'id', 'url', 'platform', 'access_token', 'status', 'last_scraped', 'created_at',
            'pages_count', 'chunks_count',
        ]
        read_only_fields = ['id', 'status', 'last_scraped', 'created_at', 'pages_count', 'chunks_count']

    def get_pages_count(self, obj):
        return obj.pages.count()

    def get_chunks_count(self, obj):
        # KnowledgeChunk links to merchant directly, not to Website, so we
        # go through the page relation instead: sum of chunks across all of
        # this website's crawled pages.
        return KnowledgeChunk.objects.filter(page__website=obj).count()

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