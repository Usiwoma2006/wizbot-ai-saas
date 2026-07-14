from django.urls import path
from .views import MerchantProfileView

urlpatterns = [
    path("me/", MerchantProfileView.as_view(), name="merchant-profile"),
]