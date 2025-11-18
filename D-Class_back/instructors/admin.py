from django.contrib import admin
from .models import InstructorProfile, Experience, Education


@admin.register(InstructorProfile)
class InstructorProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'specialties', 'created_at']
    search_fields = ['user__name', 'user__email']
    list_filter = ['created_at']


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ['instructor', 'institution', 'position', 'start_date', 'end_date']
    search_fields = ['institution', 'position']
    list_filter = ['start_date']


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['instructor', 'school', 'major', 'degree', 'start_date']
    search_fields = ['school', 'major']
    list_filter = ['degree', 'start_date']
