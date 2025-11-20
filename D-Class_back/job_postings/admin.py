from django.contrib import admin
from .models import JobPosting


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ['title', 'academy', 'region', 'district', 'status', 'created_at']
    search_fields = ['title', 'academy__name', 'address']
    list_filter = ['status', 'region', 'salary_type', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
