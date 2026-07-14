from django.contrib import admin
from .models import ChatSession, ChatMessage, FallbackTicket

admin.site.register(ChatSession)
admin.site.register(ChatMessage)
admin.site.register(FallbackTicket)

# Register your models here.
