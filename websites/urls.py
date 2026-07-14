from django.urls import path
from .views import EmbeddingJobStatusView, WebsiteListCreateView
from .views import WebsiteListCreateView, WebsiteSyncView

urlpatterns = [
    path("", WebsiteListCreateView.as_view(), name="websites"),
     path("<uuid:pk>/sync/", WebsiteSyncView.as_view(), name="website-sync"),
     path("jobs/<uuid:job_id>/", EmbeddingJobStatusView.as_view(), name="embedding-job-status"),
]