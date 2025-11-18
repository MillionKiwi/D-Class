from rest_framework import serializers
from .models import Review
from django.db.models import Avg, Count


class ReviewCreateSerializer(serializers.ModelSerializer):
    """리뷰 작성 시리얼라이저"""
    application_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Review
        fields = ['application_id', 'rating', 'content']
    
    def validate(self, attrs):
        from applications.models import Application
        application_id = attrs['application_id']
        user = self.context['request'].user
        
        try:
            application = Application.objects.get(id=application_id)
        except Application.DoesNotExist:
            raise serializers.ValidationError({'application_id': '존재하지 않는 지원입니다'})
        
        # 채용 확정된 지원에 대해서만 리뷰 작성 가능
        if application.status != 'accepted':
            raise serializers.ValidationError({'detail': '채용 확정된 지원에 대해서만 리뷰를 작성할 수 있습니다'})
        
        # 이미 리뷰 작성했는지 확인
        if user.role == 'instructor':
            if Review.objects.filter(author=user, academy=application.job_posting.academy, application=application).exists():
                raise serializers.ValidationError({'detail': '이미 리뷰를 작성하셨습니다'})
        elif user.role == 'academy':
            if Review.objects.filter(author=user, instructor=application.instructor, application=application).exists():
                raise serializers.ValidationError({'detail': '이미 리뷰를 작성하셨습니다'})
        
        # 리뷰 대상 설정
        if user.role == 'instructor':
            attrs['academy'] = application.job_posting.academy
            attrs['instructor'] = None
        else:
            attrs['instructor'] = application.instructor
            attrs['academy'] = None
        
        attrs['application'] = application
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('application_id')
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    """리뷰 시리얼라이저"""
    author = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ['id', 'author', 'rating', 'content', 'created_at']
    
    def get_author(self, obj):
        # 익명 처리
        name = obj.author.name
        if len(name) > 2:
            return name[0] + '*' * (len(name) - 2) + name[-1]
        return name[0] + '*'


class ReviewListSerializer(serializers.Serializer):
    """리뷰 목록 응답 시리얼라이저"""
    academy = serializers.SerializerMethodField()
    instructor = serializers.SerializerMethodField()
    rating_distribution = serializers.SerializerMethodField()
    count = serializers.IntegerField()
    results = ReviewSerializer(many=True)
    
    def get_academy(self, obj):
        if 'academy' in obj:
            return obj['academy']
        return None
    
    def get_instructor(self, obj):
        if 'instructor' in obj:
            return obj['instructor']
        return None
    
    def get_rating_distribution(self, obj):
        if 'rating_distribution' in obj:
            return obj['rating_distribution']
        return None

