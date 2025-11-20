from django.contrib import admin
from .models import Board, Post, PostImage


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']


class PostImageInline(admin.TabularInline):
    model = PostImage
    extra = 1


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'board', 'views', 'created_at']
    list_filter = ['board', 'created_at']
    search_fields = ['title', 'content', 'author__name']
    readonly_fields = ['views', 'created_at', 'updated_at']
    inlines = [PostImageInline]
