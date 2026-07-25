from django.urls import path
from .views import (
    CustomArticleDetailView, CustomArticleListCreateView,
    EmbeddingJobStatusView, WebsiteListCreateView, WebsiteSyncView
)

urlpatterns = [
    path("", WebsiteListCreateView.as_view(), name="websites"),
     path("<uuid:pk>/sync/", WebsiteSyncView.as_view(), name="website-sync"),
     path("jobs/<uuid:job_id>/", EmbeddingJobStatusView.as_view(), name="embedding-job-status"),
     path("custom-articles/", CustomArticleListCreateView.as_view(), name="custom-articles"),
    path("custom-articles/<uuid:pk>/", CustomArticleDetailView.as_view(), name="custom-article-detail"),
]