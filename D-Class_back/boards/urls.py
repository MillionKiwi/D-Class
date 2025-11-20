from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BoardViewSet,
    PostViewSet,
    BoardPostListView
)

app_name = 'boards'

router = DefaultRouter()
router.register(r'boards', BoardViewSet, basename='board')
router.register(r'posts', PostViewSet, basename='post')

urlpatterns = [
    path('boards/<str:board_name>/posts/', BoardPostListView.as_view(), name='board-posts'),
    path('', include(router.urls)),
]

