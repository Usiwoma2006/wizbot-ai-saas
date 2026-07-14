from datetime import timedelta

from rest_framework import serializers
from .models import ChatSession, ChatMessage, FallbackTicket


class ChatMessageSerializer(serializers.ModelSerializer):
    # Frontend expects `created`, model field is `created_at` (TimeStampedModel).
    created = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'status', 'confidence_score', 'created']


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ['id', 'session_token', 'customer_email', 'created_at', 'messages']
        read_only_fields = ['id', 'session_token', 'customer_email', 'created_at', 'messages']


class ChatSessionListSerializer(serializers.ModelSerializer):
    created = serializers.DateTimeField(source='created_at', read_only=True)
    message_count = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = ['id', 'session_token', 'customer_email', 'created', 'message_count', 'status']

    def get_message_count(self, obj):
        # Relies on `messages` being prefetched in the view's queryset —
        # calling .count() here would otherwise fire one extra query per
        # session in the list (N+1). Because it's prefetched, .all() below
        # reuses the cached list instead of hitting the DB again.
        return len(obj.messages.all())

    def get_status(self, obj):
        statuses = {m.status for m in obj.messages.all() if m.role == 'assistant'}
        if not statuses:
            return 'no_response'
        if 'escalated' in statuses:
            return 'escalated'
        if 'needs_human' in statuses:
            return 'needs_human'
        return 'answered'


class FallbackTicketSerializer(serializers.ModelSerializer):
    ticket_number = serializers.SerializerMethodField()
    subject = serializers.SerializerMethodField()
    due_date = serializers.SerializerMethodField()

    class Meta:
        model = FallbackTicket
        fields = [
            'id', 'ticket_number', 'priority', 'subject',
            'customer_question', 'customer_name', 'customer_email',
            'ticket_status', 'due_date', 'created_at', 'resolved_at'
        ]
        read_only_fields = [
            'id', 'ticket_number', 'subject', 'customer_question',
            'customer_name', 'customer_email', 'due_date', 'created_at', 'resolved_at'
        ]

    def get_ticket_number(self, obj):
        return f"TC-{obj.ticket_number}"

    def get_subject(self, obj):
        text = obj.customer_question.strip()
        return text if len(text) <= 60 else text[:57] + "..."

    def get_due_date(self, obj):
        hours = obj.session.merchant.response_time_hours
        return obj.created_at + timedelta(hours=hours)