from django.db import models
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class Merchant(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop_name = models.CharField(max_length=255)
    widget_color = models.CharField(max_length=7, default='#000000')
    widget_name = models.CharField(max_length=100, default='Wiz AI')
    widget_avatar_url = models.URLField(blank=True, null=True)
    response_time_hours = models.IntegerField(default=24)
    notification_email = models.EmailField(blank=True, null=True)
    notify_on_escalation = models.BooleanField(default=True)
    embed_key = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.shop_name

# Create your models here.
