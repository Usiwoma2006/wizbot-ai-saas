from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Website, CrawledPage, EmbeddingJob, KnowledgeChunk
from .serializers import WebsiteSerializer
from .scraper import scrape_website
from .chunker import chunk_pages
from .embedder import embed_chunks
import threading


class WebsiteListCreateView(generics.ListCreateAPIView):
    serializer_class = WebsiteSerializer

    def get_queryset(self):
        return Website.objects.filter(merchant=self.request.user)

    def perform_create(self, serializer):
        serializer.save(merchant=self.request.user)


class WebsiteSyncView(APIView):

    def post(self, request, pk):
        try:
            website = Website.objects.get(id=pk, merchant=request.user)
        except Website.DoesNotExist:
            return Response(
                {"error": "Website not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        job = EmbeddingJob.objects.create(
            website=website,
            status='running'
        )

        website.status = 'scraping'
        website.save()

        thread = threading.Thread(
            target=run_scrape,
            args=(website, job)
        )
        thread.start()

        return Response(
            {
                "message": "Scraping started.",
                "job_id": str(job.id)
            },
            status=status.HTTP_202_ACCEPTED
        )


def run_scrape(website, job):
    try:
        pages = scrape_website(website.url)
        print(f"Pages found: {len(pages)}")

        job.pages_total = len(pages)
        job.save()

        for i, page_data in enumerate(pages):
            try:
                CrawledPage.objects.create(
                    website=website,
                    url=page_data['url'],
                    title=page_data['title'],
                    html=page_data['html'],
                    clean_text=page_data['clean_text'],
                    http_status=page_data['http_status'],
                    status='crawled'
                )
                print(f"Saved page {i+1}: {page_data['url']}")
            except Exception as e:
                print(f"Error saving page {i+1}: {e}")

            job.pages_done = i + 1
            job.save()

        print("Starting chunking...")
        crawled_pages = CrawledPage.objects.filter(website=website)
        chunks = chunk_pages(crawled_pages)
        print(f"Total chunks: {len(chunks)}")

        print("Starting embedding...")
        embedded_chunks = embed_chunks(chunks)
        print(f"Total embedded: {len(embedded_chunks)}")

        for chunk in embedded_chunks:
            try:
                page = CrawledPage.objects.get(id=chunk['page_id'])
                KnowledgeChunk.objects.create(
                    page=page,
                    merchant=website.merchant,
                    content=chunk['content'],
                    embedding=chunk['embedding'],
                    chunk_index=chunk['chunk_index'],
                    source_type='page'
                )
            except Exception as e:
                print(f"Error saving chunk: {e}")

        job.status = 'completed'
        job.chunks_created = len(embedded_chunks)
        job.save()

        website.status = 'ready'
        from django.utils import timezone
        website.last_scraped = timezone.now()
        website.save()

        print("Pipeline complete.")

    except Exception as e:
        print(f"Scrape failed: {e}")
        job.status = 'failed'
        job.error_message = str(e)
        job.save()

        website.status = 'failed'
        website.save()

# websites/views.py — add this

class EmbeddingJobStatusView(APIView):

    def get(self, request, job_id):
        try:
            job = EmbeddingJob.objects.get(
                id=job_id,
                website__merchant=request.user
            )
        except EmbeddingJob.DoesNotExist:
            return Response(
                {"error": "Job not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "id": str(job.id),
            "status": job.status,
            "pages_total": job.pages_total,
            "pages_done": job.pages_done,
            "chunks_created": job.chunks_created,
            "error_message": job.error_message,
        })