from django.contrib import admin
from .models import InstructorVerification, AcademyVerification, VerificationFile


@admin.register(VerificationFile)
class VerificationFileAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'file_size', 'uploaded_at']
    readonly_fields = ['uploaded_at']


@admin.register(InstructorVerification)
class InstructorVerificationAdmin(admin.ModelAdmin):
    list_display = ['instructor', 'status', 'created_at', 'reviewed_at']
    search_fields = ['instructor__name', 'instructor__email']
    list_filter = ['status', 'created_at']
    readonly_fields = ['created_at', 'reviewed_at']


@admin.register(AcademyVerification)
class AcademyVerificationAdmin(admin.ModelAdmin):
    list_display = ['academy', 'status', 'created_at', 'reviewed_at']
    search_fields = ['academy__name', 'academy__email']
    list_filter = ['status', 'created_at']
    readonly_fields = ['created_at', 'reviewed_at']
