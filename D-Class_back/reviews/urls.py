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
    path('', include(router.urls)),
    path('reviews/academy/<int:academy_id>/', AcademyReviewListView.as_view(), name='academy-reviews'),
    path('reviews/instructor/<int:instructor_id>/', InstructorReviewListView.as_view(), name='instructor-reviews'),
    path('reviews/my/', MyReviewsView.as_view(), name='my-reviews'),
]
