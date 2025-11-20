from django.contrib import admin
from .models import Notification, NotificationSettings


@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'application_result', 'verification_result', 'new_posting']
    search_fields = ['user__name', 'user__email']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'title', 'is_read', 'created_at']
    search_fields = ['user__name', 'title', 'content']
    list_filter = ['type', 'is_read', 'created_at']
    readonly_fields = ['created_at']
