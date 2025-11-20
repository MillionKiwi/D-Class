from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExperienceViewSet, EducationViewSet, InstructorProfileDetailView

app_name = 'instructors'

router = DefaultRouter()
router.register(r'me/experiences', ExperienceViewSet, basename='experience')
router.register(r'me/educations', EducationViewSet, basename='education')

urlpatterns = [
    path('', include(router.urls)),
    path('instructors/<int:instructor_id>/', InstructorProfileDetailView.as_view(), name='instructor-detail'),
]
