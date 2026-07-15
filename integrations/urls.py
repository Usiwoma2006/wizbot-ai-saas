from django.urls import path
from .views import ShopifyConnectView, ShopifyCallbackView, ShopifySyncView
 
urlpatterns = [
    path('shopify/connect/', ShopifyConnectView.as_view(), name='shopify-connect'),
    path('shopify/callback/', ShopifyCallbackView.as_view(), name='shopify-callback'),
    path('shopify/sync/', ShopifySyncView.as_view(), name='shopify-sync' )
]