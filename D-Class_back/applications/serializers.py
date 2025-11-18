from rest_framework import serializers
from .models import Application
from instructors.serializers import InstructorProfileSerializer
from job_postings.serializers import JobPostingListSerializer


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """지원 생성 시리얼라이저"""
    class Meta:
        model = Application
        fields = ['job_posting']
    
    def validate(self, attrs):
        job_posting = attrs['job_posting']
        user = self.context['request'].user
        
        # 중복 지원 체크
        if Application.objects.filter(instructor=user, job_posting=job_posting).exists():
            raise serializers.ValidationError({'detail': '이미 지원한 공고입니다'})
        
        # 공고 상태 체크
        if job_posting.status != 'active':
            raise serializers.ValidationError({'detail': '지원 가능한 공고가 아닙니다'})
        
        return attrs


class ApplicationListSerializer(serializers.ModelSerializer):
    """지원 목록 시리얼라이저 (강사용)"""
    job_posting = JobPostingListSerializer(read_only=True)
    can_review = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = ['id', 'job_posting', 'status', 'created_at', 'can_review']
    
    def get_can_review(self, obj):
        # 채용 확정된 경우에만 리뷰 작성 가능
        return obj.status == 'accepted' and not obj.reviews.exists()


class ApplicationInstructorSerializer(serializers.ModelSerializer):
    """지원자 정보 시리얼라이저 (학원용)"""
    instructor = serializers.SerializerMethodField()
    job_posting = serializers.SerializerMethodField()
    is_new = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = ['id', 'instructor', 'job_posting', 'status', 'created_at', 'is_new']
    
    def get_instructor(self, obj):
        if hasattr(obj.instructor, 'instructor_profile'):
            profile = obj.instructor.instructor_profile
            return {
                'id': obj.instructor.id,
                'name': obj.instructor.name,
                'profile_image': profile.profile_image.url if profile.profile_image else None,
                'is_verified': obj.instructor.is_verified,
                'specialties': profile.specialties
            }
        return {
            'id': obj.instructor.id,
            'name': obj.instructor.name,
            'is_verified': obj.instructor.is_verified
        }
    
    def get_job_posting(self, obj):
        return {
            'id': obj.job_posting.id,
            'title': obj.job_posting.title
        }
    
    def get_is_new(self, obj):
        # 최근 24시간 이내 지원
        from django.utils import timezone
        from datetime import timedelta
        return obj.created_at > timezone.now() - timedelta(days=1)


class ApplicationDetailSerializer(serializers.ModelSerializer):
    """지원 상세 시리얼라이저 (학원용)"""
    instructor = serializers.SerializerMethodField()
    job_posting = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = ['id', 'instructor', 'job_posting', 'status', 'created_at']
    
    def get_instructor(self, obj):
        if hasattr(obj.instructor, 'instructor_profile'):
            profile = obj.instructor.instructor_profile
            from instructors.serializers import ExperienceSerializer, EducationSerializer
            
            # 연락처 마스킹 (채용 확정 전)
            phone = obj.instructor.phone
            if obj.status != 'accepted' and not profile.contact_visible:
                if phone and len(phone) > 4:
                    phone = phone[:3] + '****' + phone[-4:]
            
            return {
                'id': obj.instructor.id,
                'name': obj.instructor.name,
                'profile_image': profile.profile_image.url if profile.profile_image else None,
                'is_verified': obj.instructor.is_verified,
                'specialties': profile.specialties,
                'bio': profile.bio,
                'phone': phone,
                'contact_visible': profile.contact_visible or obj.status == 'accepted',
                'experiences': ExperienceSerializer(profile.experiences.all(), many=True).data,
                'educations': EducationSerializer(profile.educations.all(), many=True).data,
                'average_rating': self._get_average_rating(obj.instructor),
                'review_count': self._get_review_count(obj.instructor)
            }
        return {
            'id': obj.instructor.id,
            'name': obj.instructor.name,
            'is_verified': obj.instructor.is_verified
        }
    
    def get_job_posting(self, obj):
        return {
            'id': obj.job_posting.id,
            'title': obj.job_posting.title
        }
    
    def _get_average_rating(self, instructor):
        from reviews.models import Review
        from django.db.models import Avg
        reviews = Review.objects.filter(instructor=instructor)
        if reviews.exists():
            return round(reviews.aggregate(avg=Avg('rating'))['avg'], 1)
        return None
    
    def _get_review_count(self, instructor):
        from reviews.models import Review
        return Review.objects.filter(instructor=instructor).count()

