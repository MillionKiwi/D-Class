from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """User Admin"""
    list_display = ['email', 'name', 'role', 'is_verified', 'verification_status', 'is_active', 'date_joined']
    list_filter = ['role', 'is_verified', 'verification_status', 'is_active', 'is_staff']
    search_fields = ['email', 'name', 'phone']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('개인 정보', {'fields': ('name', 'phone', 'role')}),
        ('인증 정보', {'fields': ('is_verified', 'verification_status')}),
        ('권한', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('중요한 날짜', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'phone', 'role', 'password1', 'password2'),
        }),
    )
