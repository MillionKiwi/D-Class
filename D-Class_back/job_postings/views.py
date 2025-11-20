from rest_framework import viewsets, generics, status, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import JobPosting
from .serializers import (
    JobPostingListSerializer,
    JobPostingDetailSerializer,
    JobPostingCreateSerializer,
    JobPostingMySerializer
)


class JobPostingViewSet(viewsets.ModelViewSet):
    """공고 관리 ViewSet"""
    queryset = JobPosting.objects.select_related('academy').prefetch_related(
        'applications', 'favorites'
    )
    permission_classes = [AllowAny]  # 목록/상세는 공개, 생성/수정/삭제는 권한 체크
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['region', 'district', 'status']
    search_fields = ['title', 'description', 'academy__academy_profile__academy_name']
    ordering_fields = ['created_at', 'salary']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return JobPostingListSerializer
        elif self.action == 'create':
            return JobPostingCreateSerializer
        elif self.action == 'my':
            return JobPostingMySerializer
        return JobPostingDetailSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'close', 'my']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # 상태 필터 (기본적으로 active만 표시, 하지만 명시적으로 필터링)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        elif self.action == 'list':
            # 목록 조회 시 기본적으로 active만 표시
            queryset = queryset.filter(status='active')
        
        # 장르 필터 (다중 지원: 쉼표로 구분된 여러 장르 중 하나라도 포함)
        genre = self.request.query_params.get('genre')
        if genre:
            genres = [g.strip() for g in genre.split(',') if g.strip()]
            if genres:
                # OR 조건: 여러 장르 중 하나라도 포함된 공고
                q_objects = Q()
                for g in genres:
                    q_objects |= Q(genres__contains=[g])
                queryset = queryset.filter(q_objects)
        
        # 지도 뷰 필터 (위도/경도/반경)
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius')
        if lat and lng and radius:
            # 간단한 거리 계산 (PostGIS 사용 시 더 정확)
            # 여기서는 기본 필터링만 구현
            pass
        
        return queryset
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'academy':
            raise PermissionDenied('학원만 공고를 등록할 수 있습니다')
        if user.verification_status != 'approved':
            raise PermissionDenied('인증이 완료된 학원만 공고를 등록할 수 있습니다')
        # serializer의 create 메서드에서 이미 academy와 status를 설정하므로 save()만 호출
        serializer.save()
    
    def perform_update(self, serializer):
        if serializer.instance.academy != self.request.user:
            raise PermissionDenied('본인의 공고만 수정할 수 있습니다')
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.academy != self.request.user:
            raise PermissionDenied('본인의 공고만 삭제할 수 있습니다')
        instance.delete()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def close(self, request, pk=None):
        """공고 마감"""
        posting = self.get_object()
        if posting.academy != request.user:
            return Response(
                {'detail': '본인의 공고만 마감할 수 있습니다'},
                status=status.HTTP_403_FORBIDDEN
            )
        posting.status = 'closed'
        posting.save()
        return Response({
            'message': '공고가 마감되었습니다',
            'status': 'closed'
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my(self, request):
        """내 공고 목록"""
        if request.user.role != 'academy':
            return Response(
                {'detail': '학원만 접근 가능합니다'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = self.filter_queryset(
            self.get_queryset().filter(academy=request.user)
        )
        
        # 상태 필터
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def map(self, request):
        """지도용 공고 목록"""
        # 지도 뷰용 간소화된 데이터
        queryset = self.get_queryset().filter(status='active')
        
        # 지도 영역 필터
        north = request.query_params.get('north')
        south = request.query_params.get('south')
        east = request.query_params.get('east')
        west = request.query_params.get('west')
        
        if north and south and east and west:
            queryset = queryset.filter(
                latitude__gte=south,
                latitude__lte=north,
                longitude__gte=west,
                longitude__lte=east
            )
        
        postings = []
        for posting in queryset[:100]:  # 최대 100개
            postings.append({
                'id': posting.id,
                'title': posting.title,
                'location': {
                    'lat': float(posting.latitude) if posting.latitude else None,
                    'lng': float(posting.longitude) if posting.longitude else None
                },
                'academy': {
                    'id': posting.academy.id,
                    'name': posting.academy.academy_profile.academy_name if hasattr(posting.academy, 'academy_profile') else posting.academy.name,
                    'is_verified': posting.academy.is_verified
                },
                'salary': posting.salary
            })
        
        return Response({
            'postings': postings,
            'clusters': []  # 클러스터링은 프론트엔드에서 처리
        })
