from rest_framework import serializers
from .models import InstructorVerification, AcademyVerification, VerificationFile


class VerificationFileSerializer(serializers.ModelSerializer):
    """인증 서류 파일 시리얼라이저"""
    file = serializers.FileField(read_only=True)
    
    class Meta:
        model = VerificationFile
        fields = ['id', 'file', 'file_name', 'file_size']


class InstructorVerificationSerializer(serializers.ModelSerializer):
    """강사 인증 시리얼라이저"""
    files = VerificationFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = InstructorVerification
        fields = ['id', 'status', 'rejection_reason', 'files', 'created_at', 'reviewed_at']
        read_only_fields = ['id', 'status', 'rejection_reason', 'created_at', 'reviewed_at']


class AcademyVerificationSerializer(serializers.ModelSerializer):
    """학원 인증 시리얼라이저"""
    file = VerificationFileSerializer(read_only=True)
    
    class Meta:
        model = AcademyVerification
        fields = ['id', 'status', 'rejection_reason', 'file', 'created_at', 'reviewed_at']
        read_only_fields = ['id', 'status', 'rejection_reason', 'created_at', 'reviewed_at']

