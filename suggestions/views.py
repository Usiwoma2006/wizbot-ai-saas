from rest_framework import generics
from .models import AISuggestion
from .serializers import AISuggestionSerializer


class AISuggestionListView(generics.ListAPIView):
    serializer_class = AISuggestionSerializer

    def get_queryset(self):
        # No direct merchant FK on AISuggestion — scoped via fallback -> session
        # -> merchant. Any suggestion with fallback=None is invisible here by
        # construction. Fine today since suggestions only originate from the
        # fallback flow; revisit if that assumption ever changes.
        qs = (
            AISuggestion.objects
            .filter(fallback__session__merchant=self.request.user)
            .select_related('fallback')
            .order_by('-created_at')
        )
        status = self.request.query_params.get('status')
        if status:
            qs = qs.filter(status=status)
        return qs


class AISuggestionUpdateView(generics.UpdateAPIView):
    serializer_class = AISuggestionSerializer
    http_method_names = ['patch']

    def get_queryset(self):
        return AISuggestion.objects.filter(fallback__session__merchant=self.request.user)
