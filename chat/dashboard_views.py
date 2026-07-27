from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Avg, Q
from django.db.models.functions import TruncDate
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ChatMessage
from websites.searcher import search_knowledge_base
from chat.responder import generate_response


def _range_bounds(range_param):
    now = timezone.now()
    if range_param == '30d':
        start = now - timedelta(days=30)
        prev_start = start - timedelta(days=30)
    elif range_param == 'month':
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        # previous calendar month, same length approximation
        prev_start = (start - timedelta(days=1)).replace(day=1)
    else:  # '7d' default
        start = now - timedelta(days=7)
        prev_start = start - timedelta(days=7)
    return prev_start, start, now


def _pct_delta(current, previous):
    if not previous:
        return None  # no baseline to compare against — frontend hides delta when null
    return round(((current - previous) / previous) * 100, 1)


class DashboardSummaryView(APIView):
    def get(self, request):
        merchant = request.user
        range_param = request.query_params.get('range', '7d')
        prev_start, start, now = _range_bounds(range_param)

        current_qs = ChatMessage.objects.filter(
            session__merchant=merchant, role='assistant', created_at__gte=start, created_at__lte=now
        )
        previous_qs = ChatMessage.objects.filter(
            session__merchant=merchant, role='assistant', created_at__gte=prev_start, created_at__lt=start
        )

        def compute_stats(qs):
            total = qs.count()
            fallback_count = qs.filter(status__in=['needs_human', 'escalated']).count()
            avg_conf = qs.aggregate(v=Avg('confidence_score'))['v']
            avg_rt = qs.aggregate(v=Avg('response_time_ms'))['v']
            answered = qs.filter(status='answered').count()
            return {
                'questions_answered': total,  # changed from `answered` to `total`
                'fallback_rate': round((fallback_count / total) * 100, 1) if total else 0,
                'avg_confidence': round(avg_conf * 100, 1) if avg_conf is not None else None,
                'avg_response_time': round(avg_rt / 1000, 1) if avg_rt is not None else None,
            }

        cur = compute_stats(current_qs)
        prev = compute_stats(previous_qs)

        stats = {
            'questions_answered': cur['questions_answered'],
            'questions_answered_delta': _pct_delta(cur['questions_answered'], prev['questions_answered']),
            'fallback_rate': cur['fallback_rate'],
            'fallback_rate_delta': _pct_delta(cur['fallback_rate'], prev['fallback_rate']),
            'avg_confidence': cur['avg_confidence'],
            'avg_confidence_delta': _pct_delta(cur['avg_confidence'], prev['avg_confidence']) if cur['avg_confidence'] is not None else None,
            'avg_response_time': cur['avg_response_time'],
            'avg_response_time_delta': _pct_delta(cur['avg_response_time'], prev['avg_response_time']) if cur['avg_response_time'] is not None else None,
        }

        # Chart: answered vs fallback count per day. Frontend currently only
        # plots 'answered', but 'fallback' is included now so a second area
        # can be added later without another backend change.
        daily = (
            current_qs
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(
                answered=Count('id', filter=Q(status='answered')),
                fallback=Count('id', filter=Q(status__in=['needs_human', 'escalated'])),
            )
            .order_by('day')
        )
        chart = [
            {'day': row['day'].strftime('%b %d'), 'answered': row['answered'], 'fallback': row['fallback']}
            for row in daily
        ]

        # Top questions: exact-text grouping of customer messages in range,
        # paired with the status of the assistant reply that immediately
        # follows it in the same session.
        customer_msgs = (
            ChatMessage.objects
            .filter(session__merchant=merchant, role='customer', created_at__gte=start, created_at__lte=now)
            .order_by('session_id', 'created_at')
        )

        counts = {}
        status_for_question = {}
        for msg in customer_msgs:
            counts[msg.content] = counts.get(msg.content, 0) + 1
            if msg.content not in status_for_question:
                reply = (
                    ChatMessage.objects
                    .filter(session_id=msg.session_id, role='assistant', created_at__gt=msg.created_at)
                    .order_by('created_at')
                    .first()
                )
                status_for_question[msg.content] = (
                    'fallback' if reply and reply.status in ['needs_human', 'escalated'] else 'answered'
                )

        top_questions = [
            {'question': q, 'status': status_for_question[q]}
            for q, _ in sorted(counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

        return Response({'stats': stats, 'chart': chart, 'top_questions': top_questions})

class AIPreviewView(APIView):

    def post(self, request):
        question = request.data.get('question')

        if not question:
            return Response(
                {"error": "question is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        relevant_chunks, top_raw_similarity = search_knowledge_base(question, request.user)
        ai_response = generate_response(question, relevant_chunks, top_raw_similarity)

        return Response({
            'answer': ai_response['answer'],
            'confidence': round(ai_response['confidence'], 3),
            'sources': ai_response['sources'],
            'can_answer': bool(relevant_chunks),
            'chunks': [
                {
                    'content': chunk['content'],
                    'similarity': round(chunk['similarity'], 3),
                    'source_type': chunk['source_type'],
                }
                for chunk in relevant_chunks
            ],
        })