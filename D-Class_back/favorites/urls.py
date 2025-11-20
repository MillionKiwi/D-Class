from django.urls import path
from .views import FavoriteToggleView, FavoriteListView

app_name = 'favorites'

urlpatterns = [
    path('favorites/toggle/', FavoriteToggleView.as_view(), name='favorite-toggle'),
    path('favorites/', FavoriteListView.as_view(), name='favorite-list'),
]
