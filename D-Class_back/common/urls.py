from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TermServiceView,
    TermPrivacyView,
    FAQListView,
    InquiryViewSet
)
from .search_views import SearchAutocompleteView, SearchPopularView

app_name = 'common'

router = DefaultRouter()
router.register(r'inquiries', InquiryViewSet, basename='inquiry')

urlpatterns = [
    path('', include(router.urls)),
    path('terms/service/', TermServiceView.as_view(), name='terms-service'),
    path('terms/privacy/', TermPrivacyView.as_view(), name='terms-privacy'),
    path('faq/', FAQListView.as_view(), name='faq'),
    path('search/autocomplete/', SearchAutocompleteView.as_view(), name='search-autocomplete'),
    path('search/popular/', SearchPopularView.as_view(), name='search-popular'),
]
