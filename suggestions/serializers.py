from rest_framework import serializers
from .models import AISuggestion


class AISuggestionSerializer(serializers.ModelSerializer):
    created = serializers.DateTimeField(source='created_at', read_only=True)
    # Frontend renders "#{item.fallback}" as a ticket reference — surfacing
    # the human-readable ticket_number is more useful than the raw FK id.
    fallback = serializers.SerializerMethodField()

    class Meta:
        model = AISuggestion
        fields = [
            'id', 'suggestion_type', 'context', 'recommendation', 'reason',
            'confidence_score', 'status', 'created', 'fallback',
        ]
        read_only_fields = ['id', 'suggestion_type', 'context', 'recommendation', 'reason', 'confidence_score', 'created', 'fallback']

    def get_fallback(self, obj):
        return obj.fallback.ticket_number if obj.fallback else None