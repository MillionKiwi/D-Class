from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Application
from .serializers import (
    ApplicationCreateSerializer,
    ApplicationListSerializer,
    ApplicationInstructorSerializer,
    ApplicationDetailSerializer
)
from notifications.models import Notification


class ApplicationViewSet(viewsets.ModelViewSet):
    """지원 관리 ViewSet"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'job_posting']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'instructor':
            # 강사: 내 지원 목록
            return Application.objects.filter(instructor=user).select_related(
                'job_posting', 'job_posting__academy'
            ).prefetch_related('job_posting__academy__academy_profile')
        elif user.role == 'academy':
            # 학원: 내 공고의 지원자 목록
            return Application.objects.filter(
                job_posting__academy=user
            ).select_related('instructor', 'job_posting').prefetch_related(
                'instructor__instructor_profile'
            )
        return Application.objects.none()
    
    def get_serializer_class(self):
        user = self.request.user
        
        if self.action == 'create':
            return ApplicationCreateSerializer
        elif self.action == 'retrieve':
            if user.role == 'academy':
                return ApplicationDetailSerializer
            return ApplicationListSerializer
        elif user.role == 'instructor':
            return ApplicationListSerializer
        else:
            return ApplicationInstructorSerializer
    
    def get_serializer_context(self):
        """Serializer context에 request 추가"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'instructor':
            raise PermissionDenied('강사만 지원할 수 있습니다')
        if user.verification_status != 'approved':
            raise PermissionDenied('인증이 완료된 강사만 지원할 수 있습니다')
        application = serializer.save(instructor=user, status='pending')
        
        # 학원에게 알림 발송
        Notification.objects.create(
            user=application.job_posting.academy,
            type='new_application',
            title='새 지원 알림',
            content=f'{application.instructor.name}님이 "{application.job_posting.title}" 공고에 지원하셨습니다',
            related_url=f'/applications/{application.id}/'
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def accept(self, request, pk=None):
        """채용 확정"""
        application = self.get_object()
        
        if request.user.role != 'academy' or application.job_posting.academy != request.user:
            return Response(
                {'detail': '권한이 없습니다'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application.status = 'accepted'
        application.save()
        
        # 강사 프로필 연락처 공개
        if hasattr(application.instructor, 'instructor_profile'):
            application.instructor.instructor_profile.contact_visible = True
            application.instructor.instructor_profile.save()
        
        # 강사에게 알림 발송
        Notification.objects.create(
            user=application.instructor,
            type='application_accepted',
            title='지원 결과 알림',
            content=f'{application.job_posting.academy.academy_profile.academy_name if hasattr(application.job_posting.academy, "academy_profile") else application.job_posting.academy.name}의 "{application.job_posting.title}" 공고에 최종 합격하셨습니다',
            related_url=f'/applications/{application.id}/'
        )
        
        return Response({
            'message': '채용이 확정되었습니다',
            'status': 'accepted',
            'contact_visible': True
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        """불합격 처리"""
        application = self.get_object()
        
        if request.user.role != 'academy' or application.job_posting.academy != request.user:
            return Response(
                {'detail': '권한이 없습니다'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        reason = request.data.get('reason', '')
        application.status = 'rejected'
        application.rejection_reason = reason
        application.save()
        
        # 강사에게 알림 발송
        Notification.objects.create(
            user=application.instructor,
            type='application_rejected',
            title='지원 결과 알림',
            content=f'{application.job_posting.academy.academy_profile.academy_name if hasattr(application.job_posting.academy, "academy_profile") else application.job_posting.academy.name}의 "{application.job_posting.title}" 공고에 불합격 처리되었습니다',
            related_url=f'/applications/{application.id}/'
        )
        
        return Response({
            'message': '불합격 처리되었습니다',
            'status': 'rejected'
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        """지원 취소 (강사만 가능)"""
        application = self.get_object()
        
        # 강사만 자신의 지원을 취소할 수 있음
        if request.user.role != 'instructor' or application.instructor != request.user:
            return Response(
                {'detail': '권한이 없습니다'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 채용 확정된 지원은 취소할 수 없음
        if application.status == 'accepted':
            return Response(
                {'detail': '채용 확정된 지원은 취소할 수 없습니다'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 알림 발송을 위해 필요한 정보 저장
        application_id = application.id
        academy = application.job_posting.academy
        job_posting_title = application.job_posting.title
        job_posting_id = application.job_posting.id
        instructor_name = application.instructor.name
        
        # 지원 삭제
        application.delete()
        
        # 학원에게 알림 발송
        Notification.objects.create(
            user=academy,
            type='application_cancelled',
            title='지원 취소 알림',
            content=f'{instructor_name}님이 "{job_posting_title}" 공고 지원을 취소하셨습니다',
            related_url=f'/job-postings/{job_posting_id}/'
        )
        
        return Response({
            'message': '지원이 취소되었습니다',
            'application_id': application_id
        }, status=status.HTTP_200_OK)


class MyApplicationsView(generics.ListAPIView):
    """내 지원 현황 조회 (강사)"""
    permission_classes = [IsAuthenticated]
    serializer_class = ApplicationListSerializer
    
    def get_queryset(self):
        if self.request.user.role != 'instructor':
            return Application.objects.none()
        return Application.objects.filter(
            instructor=self.request.user
        ).select_related('job_posting', 'job_posting__academy').prefetch_related(
            'job_posting__academy__academy_profile'
        )
    
    def get_serializer_context(self):
        """Serializer context에 request 추가"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
