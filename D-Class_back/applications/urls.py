from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicationViewSet, MyApplicationsView

app_name = 'applications'

router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    # 커스텀 경로를 Router 등록 전에 먼저 등록 (더 구체적인 패턴 우선 매칭)
    path('applications/my/', MyApplicationsView.as_view(), name='my-applications'),
    path('', include(router.urls)),
]
