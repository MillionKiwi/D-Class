from django.contrib import admin
from .models import Favorite


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['instructor', 'job_posting', 'created_at']
    search_fields = ['instructor__name', 'job_posting__title']
    list_filter = ['created_at']
