import time
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import ChatSession, ChatMessage, FallbackTicket
from accounts.models import Merchant
from websites.searcher import search_knowledge_base
from chat.responder import generate_response, resolve_query
from .serializers import (
    FallbackTicketSerializer,
    ChatSessionListSerializer,
    ChatMessageSerializer,
)


class StartSessionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, embed_key):
        try:
            merchant = Merchant.objects.get(embed_key=embed_key)
        except Merchant.DoesNotExist:
            return Response(
                {"error": "Invalid embed key."},
                status=status.HTTP_404_NOT_FOUND
            )

        website = merchant.websites.filter(status='ready').first()
        if not website:
            return Response(
                {"error": "No active knowledge base found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        session = ChatSession.objects.create(
            merchant=merchant,
            website=website
        )

        return Response({
            "session_token": str(session.session_token),
            "widget_name": merchant.widget_name,
            "widget_color": merchant.widget_color,
        }, status=status.HTTP_201_CREATED)


class ChatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, embed_key):
        session_token = request.data.get('session_token')
        question = request.data.get('message')

        if not session_token or not question:
            return Response(
                {"error": "session_token and message are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            session = ChatSession.objects.get(session_token=session_token)
        except ChatSession.DoesNotExist:
            return Response(
                {"error": "Invalid session."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Grab recent history BEFORE creating this new message, so the
        # rewrite step isn't resolving the question against itself.
        # Last 6 messages ≈ last 3 customer/assistant turns.
        recent_messages = list(session.messages.order_by('-created_at')[:6])
        history_messages = [
            {"role": m.role, "content": m.content}
            for m in reversed(recent_messages)
        ]

        ChatMessage.objects.create(
            session=session,
            role=ChatMessage.Role.CUSTOMER,
            content=question,
            status=ChatMessage.MessageStatus.ANSWERED
        )

        resolved_question = resolve_query(question, history_messages)
        print(f"DEBUG — original: '{question}' | resolved: '{resolved_question}'", flush=True)

        start_time = time.time()
        relevant_chunks, top_raw_similarity = search_knowledge_base(resolved_question, session.merchant)
        print(f"DEBUG — query: '{resolved_question}' | top_raw_similarity: {top_raw_similarity}", flush=True)
        ai_response = generate_response(resolved_question, relevant_chunks, top_raw_similarity)

        message_status = (
            ChatMessage.MessageStatus.NEEDS_HUMAN
            if ai_response['needs_human']
            else ChatMessage.MessageStatus.ANSWERED
        )
        ChatMessage.objects.create(
            session=session,
            role=ChatMessage.Role.ASSISTANT,
            content=ai_response['answer'],
            status=message_status,
            confidence_score=ai_response['confidence'],
            response_time_ms=response_time,
            sources=ai_response['sources'],
            products=ai_response['products']   # NEW
        )

        if ai_response['needs_human']:
            confidence = ai_response['confidence']

            if confidence < 0.15:
                priority = FallbackTicket.Priority.URGENT
            elif confidence < 0.25:
                priority = FallbackTicket.Priority.MEDIUM
            else:
                priority = FallbackTicket.Priority.LOW

            existing_open_ticket = FallbackTicket.objects.filter(
                session=session,
                ticket_status=FallbackTicket.TicketStatus.NEW
            ).exists()

            if not existing_open_ticket:
                FallbackTicket.objects.create(
                    session=session,
                    customer_question=question,
                    customer_email=session.customer_email,
                    ticket_status=FallbackTicket.TicketStatus.NEW,
                    priority=priority,
                )

        return Response({
            "answer": ai_response['answer'],
            "needs_human": ai_response['needs_human'],
            "confidence": ai_response['confidence'],
            "products": ai_response['products'],
            "sources": ai_response['sources'],
            "response_time_ms": response_time
        })


class ChatHistoryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, embed_key):
        session_token = request.GET.get('session_token')

        if not session_token:
            return Response(
                {"error": "session_token is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            session = ChatSession.objects.get(session_token=session_token)
        except ChatSession.DoesNotExist:
            return Response(
                {"error": "Invalid session."},
                status=status.HTTP_404_NOT_FOUND
            )

        messages = session.messages.all()
        data = [
            {
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at
            }
            for msg in messages
        ]

        return Response({"messages": data})


class WidgetConfigView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, embed_key):
        try:
            merchant = Merchant.objects.get(embed_key=embed_key)
        except Merchant.DoesNotExist:
            return Response(
                {"error": "Invalid embed key."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "widget_name": merchant.widget_name,
            "widget_color": merchant.widget_color,
            "widget_avatar_url": merchant.widget_avatar_url,
            "response_time_hours": merchant.response_time_hours
        })


class TicketListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tickets = FallbackTicket.objects.filter(
            session__merchant=request.user
        ).order_by('-created_at')

        priority = request.GET.get('priority')
        if priority:
            tickets = tickets.filter(priority=priority)

        serializer = FallbackTicketSerializer(tickets, many=True)
        return Response(serializer.data)


class TicketDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, ticket_id):
        try:
            ticket = FallbackTicket.objects.get(
                id=ticket_id,
                session__merchant=request.user
            )
        except FallbackTicket.DoesNotExist:
            return Response(
                {"error": "Ticket not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = FallbackTicketSerializer(ticket, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            if serializer.validated_data.get('ticket_status') == FallbackTicket.TicketStatus.CLOSED:
                from django.utils import timezone
                ticket.resolved_at = timezone.now()
                ticket.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChatSessionListView(generics.ListAPIView):
    serializer_class = ChatSessionListSerializer

    def get_queryset(self):
        qs = (
            ChatSession.objects
            .filter(merchant=self.request.user)
            .prefetch_related('messages')
            .order_by('-created_at')
        )
        search = self.request.query_params.get('search')
        if search:
            # session_token is a UUIDField — Django can't run icontains on it
            # (raises a validation error, not an empty result), so search is
            # scoped to customer_email for now.
            qs = qs.filter(customer_email__icontains=search)
        return qs


class ChatSessionMessagesView(generics.ListAPIView):
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        return (
            ChatMessage.objects
            .filter(
                session_id=self.kwargs['session_id'],
                session__merchant=self.request.user,  # scoped to the logged-in merchant
            )
            .order_by('created_at')
        )