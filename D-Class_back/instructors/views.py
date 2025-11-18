from rest_framework import status, generics, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import InstructorProfile, Experience, Education
from .serializers import ExperienceSerializer, EducationSerializer, InstructorProfileSerializer
from users.models import User


class ExperienceViewSet(viewsets.ModelViewSet):
    """경력 관리 ViewSet"""
    permission_classes = [IsAuthenticated]
    serializer_class = ExperienceSerializer
    
    def get_queryset(self):
        if not hasattr(self.request.user, 'instructor_profile'):
            return Experience.objects.none()
        return Experience.objects.filter(instructor=self.request.user.instructor_profile)
    
    def perform_create(self, serializer):
        profile, created = InstructorProfile.objects.get_or_create(user=self.request.user)
        serializer.save(instructor=profile)


class EducationViewSet(viewsets.ModelViewSet):
    """학력 관리 ViewSet"""
    permission_classes = [IsAuthenticated]
    serializer_class = EducationSerializer
    
    def get_queryset(self):
        if not hasattr(self.request.user, 'instructor_profile'):
            return Education.objects.none()
        return Education.objects.filter(instructor=self.request.user.instructor_profile)
    
    def perform_create(self, serializer):
        profile, created = InstructorProfile.objects.get_or_create(user=self.request.user)
        serializer.save(instructor=profile)


class InstructorProfileDetailView(generics.RetrieveAPIView):
    """강사 프로필 조회 (공개)"""
    permission_classes = [AllowAny]
    serializer_class = InstructorProfileSerializer
    lookup_field = 'user_id'
    lookup_url_kwarg = 'instructor_id'
    
    def get_queryset(self):
        return InstructorProfile.objects.select_related('user').prefetch_related(
            'experiences', 'educations'
        )
    
    def get_object(self):
        instructor_id = self.kwargs.get('instructor_id')
        user = get_object_or_404(User, id=instructor_id, role='instructor')
        profile, created = InstructorProfile.objects.get_or_create(user=user)
        return profile
