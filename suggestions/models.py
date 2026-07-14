import uuid
from django.db import models
from websites.models import TimeStampedModel


class AISuggestion(TimeStampedModel):

    class SuggestionType(models.TextChoices):
        ANSWER = 'answer', 'Answer'
        MISSING_CONTENT = 'missing_content', 'Missing Content'
        OUTDATED_CONTENT = 'outdated_content', 'Outdated Content'
        IMPROVE_PAGE = 'improve_page', 'Improve Page'

    class SuggestionStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fallback = models.ForeignKey(
        'chat.FallbackTicket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='suggestions'
    )
    suggestion_type = models.CharField(
        max_length=20,
        choices=SuggestionType.choices,
        default=SuggestionType.ANSWER
    )
    context = models.TextField()
    recommendation = models.TextField()
    reason = models.TextField()
    confidence_score = models.FloatField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=SuggestionStatus.choices,
        default=SuggestionStatus.PENDING
    )

    def __str__(self):
        return f"{self.suggestion_type} - {self.status}"