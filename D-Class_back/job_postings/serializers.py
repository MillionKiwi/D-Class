from rest_framework import serializers
from .models import JobPosting
from academies.serializers import AcademyProfileSerializer


class JobPostingListSerializer(serializers.ModelSerializer):
    """공고 목록 시리얼라이저"""
    academy = serializers.SerializerMethodField()
    is_applied = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'academy', 'region', 'district', 'genres',
            'work_days', 'work_time', 'salary_type', 'salary',
            'created_at', 'status', 'is_applied', 'is_favorited', 'location'
        ]
    
    def get_academy(self, obj):
        if hasattr(obj.academy, 'academy_profile'):
            return {
                'id': obj.academy.id,
                'name': obj.academy.academy_profile.academy_name,
                'is_verified': obj.academy.is_verified
            }
        return {
            'id': obj.academy.id,
            'name': obj.academy.name,
            'is_verified': obj.academy.is_verified
        }
    
    def get_is_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'instructor':
            return obj.applications.filter(instructor=request.user).exists()
        return False
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'instructor':
            return obj.favorites.filter(instructor=request.user).exists()
        return False
    
    def get_location(self, obj):
        if obj.latitude and obj.longitude:
            return {
                'lat': float(obj.latitude),
                'lng': float(obj.longitude)
            }
        return None


class JobPostingDetailSerializer(serializers.ModelSerializer):
    """공고 상세 시리얼라이저"""
    academy = serializers.SerializerMethodField()
    is_applied = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    application_count = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'academy', 'region', 'district', 'genres',
            'classes', 'work_days', 'work_time', 'salary_type', 'salary',
            'preferred_qualifications', 'description', 'address',
            'created_at', 'status', 'is_applied', 'is_favorited',
            'application_count', 'location'
        ]
    
    def get_academy(self, obj):
        if hasattr(obj.academy, 'academy_profile'):
            profile = obj.academy.academy_profile
            from reviews.models import Review
            from django.db.models import Avg
            reviews = Review.objects.filter(academy=obj.academy)
            avg_rating = None
            review_count = reviews.count()
            if reviews.exists():
                avg_rating = round(reviews.aggregate(avg=Avg('rating'))['avg'], 1)
            
            return {
                'id': obj.academy.id,
                'name': profile.academy_name,
                'is_verified': obj.academy.is_verified,
                'average_rating': avg_rating,
                'review_count': review_count,
                'address': profile.address,
                'location': {
                    'lat': float(profile.latitude) if profile.latitude else None,
                    'lng': float(profile.longitude) if profile.longitude else None
                } if profile.latitude and profile.longitude else None
            }
        return {
            'id': obj.academy.id,
            'name': obj.academy.name,
            'is_verified': obj.academy.is_verified
        }
    
    def get_is_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'instructor':
            return obj.applications.filter(instructor=request.user).exists()
        return False
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'instructor':
            return obj.favorites.filter(instructor=request.user).exists()
        return False
    
    def get_application_count(self, obj):
        return obj.applications.count()
    
    def get_location(self, obj):
        if obj.latitude and obj.longitude:
            return {
                'lat': float(obj.latitude),
                'lng': float(obj.longitude)
            }
        return None


class JobPostingCreateSerializer(serializers.ModelSerializer):
    """공고 생성 시리얼라이저"""
    class Meta:
        model = JobPosting
        fields = [
            'title', 'region', 'district', 'genres', 'classes',
            'work_days', 'work_time', 'salary_type', 'salary',
            'preferred_qualifications', 'description', 'address',
            'lat', 'lng'
        ]
    
    def create(self, validated_data):
        lat = validated_data.pop('lat', None)
        lng = validated_data.pop('lng', None)
        validated_data['latitude'] = lat
        validated_data['longitude'] = lng
        validated_data['academy'] = self.context['request'].user
        validated_data['status'] = 'pending'  # 관리자 검토 대기
        return super().create(validated_data)


class JobPostingMySerializer(serializers.ModelSerializer):
    """내 공고 목록 시리얼라이저"""
    application_count = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'status', 'genres', 'salary', 'salary_type',
            'application_count', 'created_at'
        ]
    
    def get_application_count(self, obj):
        return obj.applications.count()

