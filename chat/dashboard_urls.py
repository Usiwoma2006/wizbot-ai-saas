from django.urls import path
from .dashboard_views import AIPreviewView, DashboardSummaryView

urlpatterns = [
    path('summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('preview/', AIPreviewView.as_view(), name='ai-preview'),
]