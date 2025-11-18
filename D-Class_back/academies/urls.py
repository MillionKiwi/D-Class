from django.urls import path
from .views import AcademyProfileDetailView

app_name = 'academies'

urlpatterns = [
    path('academies/<int:academy_id>/', AcademyProfileDetailView.as_view(), name='academy-detail'),
]
