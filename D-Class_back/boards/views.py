from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone
from .models import Board, Post, PostImage
from .serializers import (
    BoardSerializer,
    PostListSerializer,
    PostDetailSerializer,
    PostCreateSerializer,
    PostUpdateSerializer
)


class BoardViewSet(viewsets.ReadOnlyModelViewSet):
    """게시판 관리 ViewSet (읽기 전용)"""
    queryset = Board.objects.filter(is_active=True)
    permission_classes = [AllowAny]
    serializer_class = BoardSerializer


class PostViewSet(viewsets.ModelViewSet):
    """게시글 관리 ViewSet"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['board']
    
    def get_queryset(self):
        queryset = Post.objects.select_related(
            'author', 'board'
        ).prefetch_related(
            'images', 'author__instructor_profile', 'author__academy_profile'
        )
        
        # 기본 게시판 필터링 (발레 작품 이야기)
        board_name = self.request.query_params.get('board_name', '발레 작품 이야기')
        try:
            board = Board.objects.get(name=board_name, is_active=True)
            queryset = queryset.filter(board=board)
        except Board.DoesNotExist:
            pass
        
        # comments_count는 추후 댓글 기능 구현 시 추가
        # .annotate(comments_count=Count('comments', distinct=True))
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PostCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PostUpdateSerializer
        elif self.action == 'retrieve':
            return PostDetailSerializer
        return PostListSerializer
    
    def get_serializer_context(self):
        """Serializer context에 request 추가"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        serializer.save()
    
    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            raise PermissionDenied('본인이 작성한 게시글만 수정할 수 있습니다')
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied('본인이 작성한 게시글만 삭제할 수 있습니다')
        instance.delete()
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def increment_views(self, request, pk=None):
        """조회수 증가"""
        post = self.get_object()
        post.views += 1
        post.save(update_fields=['views'])
        return Response({'views': post.views}, status=status.HTTP_200_OK)


class BoardPostListView(generics.ListAPIView):
    """게시판별 게시글 목록 조회"""
    permission_classes = [AllowAny]
    serializer_class = PostListSerializer
    filter_backends = [DjangoFilterBackend]
    
    def get_queryset(self):
        board_name = self.kwargs.get('board_name', '발레 작품 이야기')
        try:
            board = Board.objects.get(name=board_name, is_active=True)
        except Board.DoesNotExist:
            return Post.objects.none()
        
        return Post.objects.filter(
            board=board
        ).select_related(
            'author', 'board'
        ).prefetch_related(
            'images', 'author__instructor_profile', 'author__academy_profile'
        ).order_by('-created_at')
