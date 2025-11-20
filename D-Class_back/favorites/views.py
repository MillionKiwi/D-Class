from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Favorite
from .serializers import FavoriteSerializer
from job_postings.models import JobPosting


class FavoriteToggleView(generics.GenericAPIView):
    """찜 추가/제거"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.role != 'instructor':
            return Response(
                {'detail': '강사만 접근 가능합니다'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        job_posting_id = request.data.get('job_posting')
        
        if not job_posting_id:
            return Response(
                {'job_posting': ['공고 ID를 입력해주세요']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            job_posting = JobPosting.objects.get(id=job_posting_id)
        except JobPosting.DoesNotExist:
            return Response(
                {'detail': '존재하지 않는 공고입니다'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        favorite, created = Favorite.objects.get_or_create(
            instructor=request.user,
            job_posting=job_posting
        )
        
        if not created:
            # 이미 찜한 경우 제거
            favorite.delete()
            return Response({
                'is_favorited': False,
                'message': '찜 목록에서 제거되었습니다'
            })
        
        return Response({
            'is_favorited': True,
            'message': '찜 목록에 추가되었습니다'
        })


class FavoriteListView(generics.ListAPIView):
    """찜한 공고 목록"""
    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteSerializer
    
    def get_queryset(self):
        if self.request.user.role != 'instructor':
            return Favorite.objects.none()
        return Favorite.objects.filter(
            instructor=self.request.user
        ).select_related('job_posting').prefetch_related(
            'job_posting__academy__academy_profile'
        ).order_by('-created_at')
