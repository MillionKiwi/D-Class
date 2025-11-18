from django.urls import path
from .views import (
    InstructorVerificationView,
    InstructorVerificationMeView,
    InstructorVerificationResubmitView,
    AcademyVerificationView,
    AcademyVerificationMeView
)

app_name = 'verifications'

urlpatterns = [
    path('verifications/instructor/', InstructorVerificationView.as_view(), name='instructor-verification'),
    path('verifications/instructor/me/', InstructorVerificationMeView.as_view(), name='instructor-verification-me'),
    path('verifications/instructor/me/resubmit/', InstructorVerificationResubmitView.as_view(), name='instructor-verification-resubmit'),
    path('verifications/academy/', AcademyVerificationView.as_view(), name='academy-verification'),
    path('verifications/academy/me/', AcademyVerificationMeView.as_view(), name='academy-verification-me'),
]
