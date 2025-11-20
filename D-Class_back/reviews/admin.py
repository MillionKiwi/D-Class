from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['author', 'instructor', 'academy', 'rating', 'created_at']
    search_fields = ['author__name', 'content']
    list_filter = ['rating', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
