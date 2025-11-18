from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicationViewSet, MyApplicationsView

app_name = 'applications'

router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
    path('applications/my/', MyApplicationsView.as_view(), name='my-applications'),
]
