from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count
from .models import Review
from .serializers import ReviewCreateSerializer, ReviewSerializer, ReviewListSerializer
from users.models import User
from academies.models import AcademyProfile
from instructors.models import InstructorProfile


class ReviewViewSet(viewsets.ModelViewSet):
    """리뷰 관리 ViewSet"""
    queryset = Review.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = ReviewSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer
    
    def get_queryset(self):
        return Review.objects.filter(
            author=self.request.user
        ).select_related('academy', 'instructor', 'academy__academy_profile')
    
    def perform_create(self, serializer):
        # serializer의 create 메서드에서 이미 author를 설정하므로 여기서는 save만 호출
        serializer.save()
    
    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            raise PermissionDenied('본인이 작성한 리뷰만 수정할 수 있습니다')
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied('본인이 작성한 리뷰만 삭제할 수 있습니다')
        instance.delete()


class AcademyReviewListView(generics.ListAPIView):
    """학원 리뷰 목록 조회"""
    permission_classes = [AllowAny]
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        academy_id = self.kwargs.get('academy_id')
        try:
            academy = User.objects.get(id=academy_id, role='academy')
        except User.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('학원을 찾을 수 없습니다')
        return Review.objects.filter(academy=academy).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        academy_id = self.kwargs.get('academy_id')
        try:
            academy = User.objects.get(id=academy_id, role='academy')
        except User.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('학원을 찾을 수 없습니다')
        
        queryset = self.filter_queryset(self.get_queryset())
        
        # 평점 분포 계산
        rating_dist = {}
        for rating in range(1, 6):
            rating_dist[str(rating)] = queryset.filter(rating=rating).count()
        
        # 학원 정보
        if hasattr(academy, 'academy_profile'):
            profile = academy.academy_profile
            academy_info = {
                'id': academy.id,
                'name': profile.academy_name,
                'average_rating': round(queryset.aggregate(avg=Avg('rating'))['avg'], 1) if queryset.exists() else None,
                'review_count': queryset.count()
            }
        else:
            academy_info = {
                'id': academy.id,
                'name': academy.name,
                'average_rating': None,
                'review_count': queryset.count()
            }
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'academy': academy_info,
                'rating_distribution': rating_dist,
                'count': queryset.count(),
                'results': serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'academy': academy_info,
            'rating_distribution': rating_dist,
            'count': queryset.count(),
            'results': serializer.data
        })


class InstructorReviewListView(generics.ListAPIView):
    """강사 리뷰 목록 조회"""
    permission_classes = [AllowAny]
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        instructor_id = self.kwargs.get('instructor_id')
        try:
            instructor = User.objects.get(id=instructor_id, role='instructor')
        except User.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('강사를 찾을 수 없습니다')
        return Review.objects.filter(instructor=instructor).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        instructor_id = self.kwargs.get('instructor_id')
        try:
            instructor = User.objects.get(id=instructor_id, role='instructor')
        except User.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('강사를 찾을 수 없습니다')
        
        queryset = self.filter_queryset(self.get_queryset())
        
        # 강사 정보
        avg_rating = None
        if queryset.exists():
            avg_rating = round(queryset.aggregate(avg=Avg('rating'))['avg'], 1)
        instructor_info = {
            'id': instructor.id,
            'name': instructor.name,
            'average_rating': avg_rating,
            'review_count': queryset.count()
        }
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['instructor'] = instructor_info
            return response
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'instructor': instructor_info,
            'count': queryset.count(),
            'results': serializer.data
        })


class MyReviewsView(generics.ListAPIView):
    """내가 작성한 리뷰 목록"""
    permission_classes = [IsAuthenticated]
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        return Review.objects.filter(
            author=self.request.user
        ).select_related('academy', 'instructor', 'academy__academy_profile').order_by('-created_at')
