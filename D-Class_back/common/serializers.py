from rest_framework import serializers
from .models import Term, FAQCategory, FAQ, Inquiry


class TermSerializer(serializers.ModelSerializer):
    """약관 시리얼라이저"""
    class Meta:
        model = Term
        fields = ['title', 'content', 'version', 'updated_at']


class FAQSerializer(serializers.ModelSerializer):
    """FAQ 시리얼라이저"""
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer']


class FAQCategorySerializer(serializers.ModelSerializer):
    """FAQ 카테고리 시리얼라이저"""
    faqs = FAQSerializer(many=True, read_only=True)
    
    class Meta:
        model = FAQCategory
        fields = ['id', 'name', 'faqs']


class InquirySerializer(serializers.ModelSerializer):
    """문의 시리얼라이저"""
    class Meta:
        model = Inquiry
        fields = ['id', 'category', 'title', 'content', 'status', 'answer', 'created_at', 'answered_at']
        read_only_fields = ['id', 'status', 'answer', 'created_at', 'answered_at']


class InquiryCreateSerializer(serializers.ModelSerializer):
    """문의 생성 시리얼라이저"""
    class Meta:
        model = Inquiry
        fields = ['category', 'title', 'content']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

