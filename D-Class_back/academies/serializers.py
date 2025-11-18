from rest_framework import serializers
from .models import AcademyProfile
from users.models import User


class AcademyProfileSerializer(serializers.ModelSerializer):
    """학원 프로필 시리얼라이저 (공개)"""
    is_verified = serializers.BooleanField(source='user.is_verified', read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    job_postings = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    
    class Meta:
        model = AcademyProfile
        fields = [
            'id', 'academy_name', 'academy_image', 'is_verified',
            'address', 'phone', 'operating_hours', 'main_genres',
            'description', 'facilities', 'average_rating', 'review_count',
            'job_postings', 'reviews', 'location'
        ]
    
    def get_average_rating(self, obj):
        from reviews.models import Review
        from django.db.models import Avg
        reviews = Review.objects.filter(academy=obj.user)
        if reviews.exists():
            return round(reviews.aggregate(avg=Avg('rating'))['avg'], 1)
        return None
    
    def get_review_count(self, obj):
        from reviews.models import Review
        return Review.objects.filter(academy=obj.user).count()
    
    def get_job_postings(self, obj):
        from job_postings.models import JobPosting
        postings = JobPosting.objects.filter(
            academy=obj.user,
            status='active'
        )[:5]  # 최근 5개만
        return [{
            'id': p.id,
            'title': p.title,
            'genres': p.genres,
            'salary': p.salary,
            'status': p.status
        } for p in postings]
    
    def get_reviews(self, obj):
        from reviews.models import Review
        reviews = Review.objects.filter(academy=obj.user).order_by('-created_at')[:3]
        return [{
            'id': r.id,
            'rating': r.rating,
            'content': r.content,
            'created_at': r.created_at
        } for r in reviews]
    
    def get_location(self, obj):
        if obj.latitude and obj.longitude:
            return {
                'lat': float(obj.latitude),
                'lng': float(obj.longitude)
            }
        return None

