from django.contrib import admin
from .models import Website, CrawledPage, EmbeddingJob, KnowledgeChunk

admin.site.register(Website)
admin.site.register(CrawledPage)
admin.site.register(EmbeddingJob)
admin.site.register(KnowledgeChunk)
# Register your models here.
