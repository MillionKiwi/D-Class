from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReviewViewSet,
    AcademyReviewListView,
    InstructorReviewListView,
    MyReviewsView
)

app_name = 'reviews'

router = DefaultRouter()
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    # 커스텀 경로를 Router 등록 전에 먼저 등록 (더 구체적인 패턴 우선 매칭)
    path('reviews/my/', MyReviewsView.as_view(), name='my-reviews'),
    path('reviews/academy/<int:academy_id>/', AcademyReviewListView.as_view(), name='academy-reviews'),
    path('reviews/instructor/<int:instructor_id>/', InstructorReviewListView.as_view(), name='instructor-reviews'),
    path('', include(router.urls)),
]
