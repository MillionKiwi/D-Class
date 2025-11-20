from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobPostingViewSet

app_name = 'job_postings'

router = DefaultRouter()
router.register(r'job-postings', JobPostingViewSet, basename='job-posting')

urlpatterns = [
    path('', include(router.urls)),
]
