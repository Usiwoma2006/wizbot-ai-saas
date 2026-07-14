import uuid
from django.db import models
from websites.models import TimeStampedModel


class ChatSession(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    merchant = models.ForeignKey(
        'accounts.Merchant',
        on_delete=models.CASCADE,
        related_name='chat_sessions'
    )
    website = models.ForeignKey(
        'websites.Website',
        on_delete=models.CASCADE,
        related_name='chat_sessions'
    )
    session_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    customer_email = models.EmailField(null=True, blank=True)

    def __str__(self):
        return str(self.session_token)


class ChatMessage(TimeStampedModel):

    class Role(models.TextChoices):
        CUSTOMER = 'customer', 'Customer'
        ASSISTANT = 'assistant', 'Assistant'

    class MessageStatus(models.TextChoices):
        ANSWERED = 'answered', 'Answered'
        NEEDS_HUMAN = 'needs_human', 'Needs Human'
        ESCALATED = 'escalated', 'Escalated'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        'chat.ChatSession',
        on_delete=models.CASCADE,
        related_name='messages'
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices
    )
    content = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=MessageStatus.choices,
        default=MessageStatus.ANSWERED
    )
    confidence_score = models.FloatField(null=True, blank=True)
    response_time_ms = models.IntegerField(null=True, blank=True)
    tokens_used = models.IntegerField(null=True, blank=True)
    sources = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}"


class FallbackTicket(TimeStampedModel):

    class TicketStatus(models.TextChoices):
        NEW = 'new', 'New'
        IN_PROGRESS = 'in_progress', 'In Progress'
        AWAITING_CUSTOMER = 'awaiting_customer', 'Awaiting Customer'
        CLOSED = 'closed', 'Closed'

    class Priority(models.TextChoices):
        URGENT = 'urgent', 'Urgent'
        MEDIUM = 'medium', 'Medium'
        LOW = 'low', 'Low'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.PositiveIntegerField(unique=True, null=True, blank=True)
    session = models.ForeignKey(
        'chat.ChatSession',
        on_delete=models.CASCADE,
        related_name='fallback_tickets'
    )
    customer_question = models.TextField()
    customer_email = models.EmailField(null=True, blank=True)
    customer_name = models.CharField(max_length=255, blank=True)
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    ticket_status = models.CharField(
        max_length=20,
        choices=TicketStatus.choices,
        default=TicketStatus.NEW
    )
    resolved_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.ticket_number is None:
            last = FallbackTicket.objects.order_by('-ticket_number').first()
            self.ticket_number = (last.ticket_number + 1) if last and last.ticket_number else 100
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"Ticket - {self.ticket_status}"