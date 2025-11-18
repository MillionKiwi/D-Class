from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Notification, NotificationSettings
from .serializers import NotificationSerializer, NotificationSettingsSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """알림 관리 ViewSet (읽기 전용 + 커스텀 액션)"""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_read']
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        unread_count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'unread_count': unread_count,
                'count': queryset.count(),
                'results': serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'unread_count': unread_count,
            'count': queryset.count(),
            'results': serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """알림 삭제"""
        notification = self.get_object()
        if notification.user != request.user:
            raise PermissionDenied('권한이 없습니다')
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated], url_path='read')
    def mark_read(self, request, pk=None):
        """알림 읽음 처리"""
        notification = self.get_object()
        if notification.user != request.user:
            raise PermissionDenied('권한이 없습니다')
        notification.is_read = True
        notification.save()
        return Response({
            'id': notification.id,
            'is_read': True
        })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], url_path='read-all')
    def read_all(self, request):
        """모든 알림 읽음 처리"""
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'message': '모든 알림이 읽음 처리되었습니다',
            'read_count': count
        })


class NotificationSettingsView(generics.RetrieveUpdateAPIView):
    """알림 설정 조회/수정"""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSettingsSerializer
    
    def get_object(self):
        settings, created = NotificationSettings.objects.get_or_create(
            user=self.request.user
        )
        return settings
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return Response({
            'message': '설정이 저장되었습니다',
            'settings': response.data
        })
