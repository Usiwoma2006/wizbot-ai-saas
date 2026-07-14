from django.urls import path
from .views import ChatSessionListView, ChatSessionMessagesView

urlpatterns = [
    path('', ChatSessionListView.as_view(), name='chat-session-list'),
    path('<uuid:session_id>/messages/', ChatSessionMessagesView.as_view(), name='chat-session-messages'),
]
