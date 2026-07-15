from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/merchant/", include("accounts.merchant_urls")),
    path("api/websites/", include("websites.urls")),
    path("api/widget/", include("chat.urls")),
    path("api/tickets/", include("chat.ticket_urls")),
    path("api/chat-sessions/", include("chat.chatlog_urls")),
    path("api/suggestions/", include("suggestions.urls")),
    path("api/dashboard/", include("chat.dashboard_urls")),
    path('api/integrations/', include('integrations.urls')),
]

"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""