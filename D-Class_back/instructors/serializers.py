from rest_framework import serializers
from django.db.models import Avg
from .models import InstructorProfile, Experience, Education
from users.serializers import UserSerializer


class ExperienceSerializer(serializers.ModelSerializer):
    """경력 시리얼라이저"""
    class Meta:
        model = Experience
        fields = ['id', 'institution', 'position', 'start_date', 'end_date', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class EducationSerializer(serializers.ModelSerializer):
    """학력 시리얼라이저"""
    class Meta:
        model = Education
        fields = ['id', 'school', 'major', 'degree', 'start_date', 'end_date', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class InstructorProfileSerializer(serializers.ModelSerializer):
    """강사 프로필 시리얼라이저 (공개)"""
    name = serializers.CharField(source='user.name', read_only=True)
    profile_image = serializers.ImageField(read_only=True)
    is_verified = serializers.BooleanField(source='user.is_verified', read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    educations = EducationSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    contact_visible = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = InstructorProfile
        fields = [
            'id', 'name', 'profile_image', 'is_verified', 'specialties',
            'bio', 'experiences', 'educations', 'average_rating',
            'review_count', 'contact_visible'
        ]
    
    def get_average_rating(self, obj):
        from reviews.models import Review
        reviews = Review.objects.filter(instructor=obj.user)
        if reviews.exists():
            return round(reviews.aggregate(avg=Avg('rating'))['avg'], 1)
        return None
    
    def get_review_count(self, obj):
        from reviews.models import Review
        return Review.objects.filter(instructor=obj.user).count()

