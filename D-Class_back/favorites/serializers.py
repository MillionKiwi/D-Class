from rest_framework import serializers
from .models import Favorite
from job_postings.serializers import JobPostingListSerializer


class FavoriteSerializer(serializers.ModelSerializer):
    """찜 시리얼라이저"""
    job_posting = JobPostingListSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'job_posting', 'created_at']
        read_only_fields = ['id', 'created_at']

