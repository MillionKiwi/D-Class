from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['instructor', 'job_posting', 'status', 'created_at']
    search_fields = ['instructor__name', 'job_posting__title']
    list_filter = ['status', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
