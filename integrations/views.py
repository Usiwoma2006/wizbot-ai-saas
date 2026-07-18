from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import settings, status
from django.core import signing
from django_q.tasks import async_task
from django.conf import settings

from websites.models import EmbeddingJob, Website
from .models import ShopifyStore
from .shopify.oauth import (
    generate_state, get_auth_url, verify_hmac,
    verify_and_decode_state, exchange_code_for_token
)
from .shopify.sync import run_product_sync


class ShopifyConnectView(APIView):
    """
    Hit when the merchant clicks "Connect with Shopify" in onboarding.
    Merchant must already be logged in (JWT) — we need to know WHICH
    merchant is connecting before we send them off to Shopify.

    Expects: POST { "shop_domain": "their-store.myshopify.com" }
    Returns: { "auth_url": "https://their-store.myshopify.com/admin/oauth/authorize?..." }

    Frontend then does window.location.href = auth_url to actually redirect.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        shop_domain = request.data.get('shop_domain')
        if not shop_domain:
            return Response(
                {'error': 'shop_domain is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # merchant_id is encoded + signed directly into state — no session/cookie needed,
        # which matches our JWT-only, stateless auth architecture
        state = generate_state(request.user.id)

        auth_url = get_auth_url(shop_domain, state)
        return Response({'auth_url': auth_url})


class ShopifyCallbackView(APIView):
    permission_classes = []

    def get(self, request):
        params = request.GET.dict()

        if not verify_hmac(params):
            return Response({'error': 'Invalid HMAC signature'}, status=status.HTTP_403_FORBIDDEN)

        state = params.get('state')
        try:
            merchant_id = verify_and_decode_state(state)
        except signing.SignatureExpired:
            return Response({'error': 'This connection attempt expired, please try again'}, status=status.HTTP_403_FORBIDDEN)
        except signing.BadSignature:
            return Response({'error': 'Invalid state signature'}, status=status.HTTP_403_FORBIDDEN)

        shop_domain = params.get('shop')
        code = params.get('code')

        token_data = exchange_code_for_token(shop_domain, code)

        existing_store = ShopifyStore.objects.filter(shop_domain=shop_domain).first()

        if existing_store:
            website = existing_store.website
        else:
            website = Website.objects.create(
                merchant_id=merchant_id,
                platform='shopify',
                url=f'https://{shop_domain}',
                status='ready'
            )

        shopify_store, _ = ShopifyStore.objects.update_or_create(
            website=website,
            defaults={
                'shop_domain': shop_domain,
                'access_token': token_data['access_token'],
                'scope': token_data['scope'],
            }
        )

        # kick off the initial product sync via Django-Q2 — same EmbeddingJob
        # pattern as website scraping so the frontend's existing polling
        # screen works unmodified. Runs in a separate worker process, so
        # it survives web-process restarts (unlike threading.Thread).
        job = EmbeddingJob.objects.create(website=website, status='running')

        async_task(run_product_sync, shopify_store, job)

        # frontend reads job_id from query params to know which job to poll

        frontend_success_url = f'{settings.FRONTEND_URL}/website/new?shopify=connected&job_id={job.id}'
        return redirect(frontend_success_url)

class ShopifySyncView(APIView):
    def post(self, request):
        shopify_store = ShopifyStore.objects.filter(
            website__merchant=request.user
        ).first()

        if not shopify_store:
            return Response({'error': 'No connected Shopify store found.'}, status=status.HTTP_404_NOT_FOUND)

        website = shopify_store.website
        job = EmbeddingJob.objects.create(website=website, status='running')

        async_task(run_product_sync, shopify_store, job)

        return Response({'message': 'Product sync started.', 'job_id': str(job.id)}, status=status.HTTP_202_ACCEPTED)