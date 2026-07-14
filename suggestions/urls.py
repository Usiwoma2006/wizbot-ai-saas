from django.urls import path
from .views import AISuggestionListView, AISuggestionUpdateView

urlpatterns = [
    path('', AISuggestionListView.as_view(), name='suggestion-list'),
    path('<uuid:pk>/', AISuggestionUpdateView.as_view(), name='suggestion-update'),
]