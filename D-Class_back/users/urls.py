from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    EmailCheckView,
    RegisterView,
    LoginView,
    LogoutView,
    PasswordResetView,
    PasswordResetConfirmView,
    UserMeView,
    InstructorProfileUpdateView,
    AcademyProfileUpdateView,
    PasswordChangeView,
    UserDeleteView,
)

app_name = 'users'

urlpatterns = [
    # 인증
    path('auth/check-email/', EmailCheckView.as_view(), name='check-email'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/password/reset/', PasswordResetView.as_view(), name='password-reset'),
    path('auth/password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # 회원 관리
    path('users/me/', UserMeView.as_view(), name='user-me'),
    path('users/me/profile/', InstructorProfileUpdateView.as_view(), name='instructor-profile-update'),
    path('users/me/academy/', AcademyProfileUpdateView.as_view(), name='academy-profile-update'),
    path('users/me/password/change/', PasswordChangeView.as_view(), name='password-change'),
    path('users/me/delete/', UserDeleteView.as_view(), name='user-delete'),
]
