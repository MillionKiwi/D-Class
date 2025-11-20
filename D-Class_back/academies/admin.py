from django.contrib import admin
from .models import AcademyProfile


@admin.register(AcademyProfile)
class AcademyProfileAdmin(admin.ModelAdmin):
    list_display = ['academy_name', 'user', 'address', 'created_at']
    search_fields = ['academy_name', 'user__name', 'address']
    list_filter = ['created_at', 'main_genres']
