from django.contrib import admin
from .models import Term, FAQCategory, FAQ, Inquiry


@admin.register(Term)
class TermAdmin(admin.ModelAdmin):
    list_display = ['type', 'version', 'updated_at']
    readonly_fields = ['updated_at']


class FAQInline(admin.TabularInline):
    model = FAQ
    extra = 1


@admin.register(FAQCategory)
class FAQCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'order']
    inlines = [FAQInline]


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['category', 'question', 'order', 'created_at']
    search_fields = ['question', 'answer']
    list_filter = ['category', 'created_at']


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ['user', 'category', 'title', 'status', 'created_at']
    search_fields = ['user__name', 'title', 'content']
    list_filter = ['category', 'status', 'created_at']
    readonly_fields = ['created_at', 'updated_at', 'answered_at']
