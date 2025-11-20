from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import hashlib

from .models import User
from .serializers import (
    EmailCheckSerializer,
    UserRegisterSerializer,
    UserLoginSerializer,
    UserSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer,
    InstructorProfileUpdateSerializer,
    AcademyProfileUpdateSerializer,
    PasswordChangeSerializer,
    UserDeleteSerializer
)


class EmailCheckView(generics.GenericAPIView):
    """이메일 중복 확인"""
    permission_classes = [AllowAny]
    serializer_class = EmailCheckSerializer
    
    def get(self, request):
        email = request.query_params.get('email')
        
        if not email:
            return Response(
                {'available': False, 'message': '이메일을 입력해주세요'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data={'email': email})
        serializer.is_valid(raise_exception=True)
        
        exists = User.objects.filter(email=email).exists()
        
        if exists:
            return Response(
                {'available': False, 'message': '이미 사용 중인 이메일입니다'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'available': True,
            'message': '사용 가능한 이메일입니다'
        })


class RegisterView(generics.CreateAPIView):
    """회원가입"""
    permission_classes = [AllowAny]
    serializer_class = UserRegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response(
            {
                'message': '가입이 완료되었습니다',
                'user_id': user.id
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(generics.GenericAPIView):
    """로그인"""
    permission_classes = [AllowAny]
    serializer_class = UserLoginSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(request, username=email, password=password)
        
        if not user:
            return Response(
                {'detail': '이메일 또는 비밀번호가 올바르지 않습니다'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'detail': '비활성화된 계정입니다'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # JWT 토큰 생성
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user, context={'request': request}).data
        })


class LogoutView(generics.GenericAPIView):
    """로그아웃"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                # 토큰 블랙리스트 기능이 활성화된 경우에만 사용
                # token.blacklist()  # 나중에 토큰 블랙리스트 앱 추가 시 활성화
        except Exception as e:
            # 토큰이 이미 만료되었거나 유효하지 않은 경우 무시
            pass
        
        return Response(
            {'message': '로그아웃되었습니다'},
            status=status.HTTP_200_OK
        )


class PasswordResetView(generics.GenericAPIView):
    """비밀번호 찾기 (이메일 발송)"""
    permission_classes = [AllowAny]
    serializer_class = PasswordResetSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # 보안을 위해 사용자가 존재하지 않아도 성공 메시지 반환
            return Response(
                {'message': '비밀번호 재설정 링크가 이메일로 발송되었습니다'},
                status=status.HTTP_200_OK
            )
        
        # 비밀번호 재설정 토큰 생성
        token = get_random_string(32)
        user.password_reset_token = hashlib.sha256(token.encode()).hexdigest()
        user.password_reset_token_expires = timezone.now() + timedelta(hours=1)
        user.save()
        
        # 이메일 발송 (개발 환경에서는 콘솔에 출력)
        reset_url = f"{settings.FRONTEND_URL}/password-reset/confirm?token={token}"
        
        if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
            print(f"비밀번호 재설정 링크: {reset_url}")
        else:
            send_mail(
                subject='D-Match 비밀번호 재설정',
                message=f'비밀번호를 재설정하려면 다음 링크를 클릭하세요: {reset_url}',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )
        
        return Response(
            {'message': '비밀번호 재설정 링크가 이메일로 발송되었습니다'},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    """비밀번호 재설정"""
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']
        
        # 토큰 해시
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        try:
            user = User.objects.get(
                password_reset_token=token_hash,
                password_reset_token_expires__gt=timezone.now()
            )
        except User.DoesNotExist:
            return Response(
                {'detail': '유효하지 않거나 만료된 토큰입니다'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 비밀번호 변경
        user.set_password(password)
        user.password_reset_token = None
        user.password_reset_token_expires = None
        user.save()
        
        return Response(
            {'message': '비밀번호가 재설정되었습니다'},
            status=status.HTTP_200_OK
        )


class UserMeView(generics.RetrieveAPIView):
    """내 정보 조회"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


class InstructorProfileUpdateView(generics.GenericAPIView):
    """강사 프로필 수정"""
    permission_classes = [IsAuthenticated]
    serializer_class = InstructorProfileUpdateSerializer
    
    def patch(self, request):
        if request.user.role != 'instructor':
            return Response(
                {'detail': '강사만 접근 가능합니다'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 사용자 정보 업데이트
        if 'phone' in serializer.validated_data:
            request.user.phone = serializer.validated_data['phone']
            request.user.save()
        
        # 프로필 업데이트
        profile, created = request.user.instructor_profile.get_or_create(user=request.user)
        
        if 'specialties' in serializer.validated_data:
            profile.specialties = serializer.validated_data['specialties']
        if 'bio' in serializer.validated_data:
            profile.bio = serializer.validated_data['bio']
        if 'profile_image' in serializer.validated_data:
            profile.profile_image = serializer.validated_data['profile_image']
        
        profile.save()
        
        return Response({
            'message': '프로필이 저장되었습니다',
            'profile': UserSerializer(request.user, context={'request': request}).data
        })


class AcademyProfileUpdateView(generics.GenericAPIView):
    """학원 정보 수정"""
    permission_classes = [IsAuthenticated]
    serializer_class = AcademyProfileUpdateSerializer
    
    def patch(self, request):
        if request.user.role != 'academy':
            return Response(
                {'detail': '학원만 접근 가능합니다'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 사용자 정보 업데이트
        if 'phone' in serializer.validated_data:
            request.user.phone = serializer.validated_data['phone']
            request.user.save()
        
        # 학원 프로필 업데이트
        profile, created = request.user.academy_profile.get_or_create(user=request.user)
        
        if 'academy_name' in serializer.validated_data:
            profile.academy_name = serializer.validated_data['academy_name']
        if 'address' in serializer.validated_data:
            profile.address = serializer.validated_data['address']
        if 'operating_hours' in serializer.validated_data:
            profile.operating_hours = serializer.validated_data['operating_hours']
        if 'main_genres' in serializer.validated_data:
            profile.main_genres = serializer.validated_data['main_genres']
        if 'description' in serializer.validated_data:
            profile.description = serializer.validated_data['description']
        if 'facilities' in serializer.validated_data:
            profile.facilities = serializer.validated_data['facilities']
        if 'academy_image' in serializer.validated_data:
            profile.academy_image = serializer.validated_data['academy_image']
        
        profile.save()
        
        return Response({
            'message': '학원 정보가 저장되었습니다',
            'academy': UserSerializer(request.user, context={'request': request}).data
        })


class PasswordChangeView(generics.GenericAPIView):
    """비밀번호 변경"""
    permission_classes = [IsAuthenticated]
    serializer_class = PasswordChangeSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        if not request.user.check_password(old_password):
            return Response(
                {'old_password': ['현재 비밀번호가 올바르지 않습니다']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        request.user.set_password(new_password)
        request.user.save()
        
        return Response(
            {'message': '비밀번호가 변경되었습니다'},
            status=status.HTTP_200_OK
        )


class UserDeleteView(generics.GenericAPIView):
    """회원 탈퇴"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserDeleteSerializer
    
    def delete(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        password = serializer.validated_data['password']
        
        if not request.user.check_password(password):
            return Response(
                {'password': ['비밀번호가 올바르지 않습니다']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 사용자 비활성화 (실제 삭제 대신)
        request.user.is_active = False
        request.user.save()
        
        return Response(
            {'message': '회원 탈퇴가 완료되었습니다'},
            status=status.HTTP_200_OK
        )
