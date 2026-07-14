from django.urls import path
from .views import ChatSessionListView, ChatSessionMessagesView, StartSessionView, ChatView, ChatHistoryView, WidgetConfigView

urlpatterns = [
    path("<uuid:embed_key>/session/", StartSessionView.as_view(), name="start-session"),
    path("<uuid:embed_key>/chat/", ChatView.as_view(), name="chat"),
    path("<uuid:embed_key>/history/", ChatHistoryView.as_view(), name="chat-history"),
    path("<uuid:embed_key>/config/", WidgetConfigView.as_view(), name="widget-config"),
    path('', ChatSessionListView.as_view(), name='chat-session-list'),
    path('<uuid:session_id>/messages/', ChatSessionMessagesView.as_view(), name='chat-session-messages'),
]