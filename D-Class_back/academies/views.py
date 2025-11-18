from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import AcademyProfile
from .serializers import AcademyProfileSerializer
from users.models import User


class AcademyProfileDetailView(generics.RetrieveAPIView):
    """학원 프로필 조회 (공개)"""
    permission_classes = [AllowAny]
    serializer_class = AcademyProfileSerializer
    lookup_field = 'user_id'
    lookup_url_kwarg = 'academy_id'
    
    def get_queryset(self):
        return AcademyProfile.objects.select_related('user')
    
    def get_object(self):
        academy_id = self.kwargs.get('academy_id')
        user = get_object_or_404(User, id=academy_id, role='academy')
        profile, created = AcademyProfile.objects.get_or_create(user=user)
        return profile
