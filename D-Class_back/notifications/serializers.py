from rest_framework import serializers
from .models import Notification, NotificationSettings


class NotificationSerializer(serializers.ModelSerializer):
    """알림 시리얼라이저"""
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'title', 'content', 'is_read',
            'related_url', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class NotificationSettingsSerializer(serializers.ModelSerializer):
    """알림 설정 시리얼라이저"""
    class Meta:
        model = NotificationSettings
        fields = [
            'application_result', 'verification_result',
            'new_posting', 'marketing'
        ]

