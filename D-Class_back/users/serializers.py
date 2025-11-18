from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User
from instructors.models import InstructorProfile
from academies.models import AcademyProfile


class EmailCheckSerializer(serializers.Serializer):
    """이메일 중복 확인 시리얼라이저"""
    email = serializers.EmailField(required=True)


class TermsAgreedSerializer(serializers.Serializer):
    """약관 동의 시리얼라이저"""
    service = serializers.BooleanField(required=True)
    privacy = serializers.BooleanField(required=True)
    marketing = serializers.BooleanField(required=False, default=False)


class UserRegisterSerializer(serializers.ModelSerializer):
    """회원가입 시리얼라이저"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    terms_agreed = TermsAgreedSerializer(required=True)
    
    # 강사용 필드
    specialties = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    
    # 학원용 필드
    academy_name = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'role', 'email', 'password', 'name', 'phone',
            'specialties', 'academy_name', 'address', 'terms_agreed'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'name': {'required': True},
            'phone': {'required': True},
            'role': {'required': True},
        }
    
    def validate(self, attrs):
        role = attrs.get('role')
        terms_agreed = attrs.get('terms_agreed', {})
        
        # 필수 약관 동의 확인
        if not terms_agreed.get('service') or not terms_agreed.get('privacy'):
            raise serializers.ValidationError({
                'terms_agreed': {
                    'service': ['필수 약관에 동의해주세요'],
                    'privacy': ['필수 약관에 동의해주세요']
                }
            })
        
        # 역할별 필수 필드 확인
        if role == 'instructor':
            if not attrs.get('specialties'):
                raise serializers.ValidationError({
                    'specialties': ['전문 분야를 선택해주세요']
                })
        elif role == 'academy':
            if not attrs.get('academy_name'):
                raise serializers.ValidationError({
                    'academy_name': ['학원명을 입력해주세요']
                })
            if not attrs.get('address'):
                raise serializers.ValidationError({
                    'address': ['주소를 입력해주세요']
                })
        
        return attrs
    
    def create(self, validated_data):
        terms_agreed = validated_data.pop('terms_agreed')
        specialties = validated_data.pop('specialties', [])
        academy_name = validated_data.pop('academy_name', None)
        address = validated_data.pop('address', None)
        password = validated_data.pop('password')
        role = validated_data.get('role')
        
        # 사용자 생성
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        # 역할별 프로필 생성
        if role == 'instructor':
            InstructorProfile.objects.create(
                user=user,
                specialties=specialties
            )
        elif role == 'academy':
            AcademyProfile.objects.create(
                user=user,
                academy_name=academy_name,
                address=address
            )
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """로그인 시리얼라이저"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )


class UserSerializer(serializers.ModelSerializer):
    """사용자 정보 시리얼라이저"""
    profile_image = serializers.SerializerMethodField()
    specialties = serializers.SerializerMethodField()
    academy_name = serializers.SerializerMethodField()
    academy_image = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'phone', 'role',
            'profile_image', 'is_verified', 'verification_status',
            'specialties', 'academy_name', 'academy_image', 'address',
            'created_at'
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'verification_status', 'created_at']
    
    def get_profile_image(self, obj):
        if hasattr(obj, 'instructor_profile') and obj.instructor_profile.profile_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.instructor_profile.profile_image.url)
            return obj.instructor_profile.profile_image.url
        return None
    
    def get_specialties(self, obj):
        if hasattr(obj, 'instructor_profile'):
            return obj.instructor_profile.specialties
        return None
    
    def get_academy_name(self, obj):
        if hasattr(obj, 'academy_profile'):
            return obj.academy_profile.academy_name
        return None
    
    def get_academy_image(self, obj):
        if hasattr(obj, 'academy_profile') and obj.academy_profile.academy_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.academy_profile.academy_image.url)
            return obj.academy_profile.academy_image.url
        return None
    
    def get_address(self, obj):
        if hasattr(obj, 'academy_profile'):
            return obj.academy_profile.address
        return None


class InstructorProfileUpdateSerializer(serializers.Serializer):
    """강사 프로필 수정 시리얼라이저"""
    phone = serializers.CharField(required=False)
    specialties = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    bio = serializers.CharField(required=False, allow_blank=True, max_length=500)
    profile_image = serializers.ImageField(required=False, allow_null=True)


class AcademyProfileUpdateSerializer(serializers.Serializer):
    """학원 프로필 수정 시리얼라이저"""
    academy_name = serializers.CharField(required=False, max_length=100)
    address = serializers.CharField(required=False, max_length=200)
    phone = serializers.CharField(required=False, max_length=20, allow_blank=True)
    operating_hours = serializers.CharField(required=False, max_length=50, allow_blank=True)
    main_genres = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    description = serializers.CharField(required=False, allow_blank=True, max_length=1000)
    facilities = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )
    academy_image = serializers.ImageField(required=False, allow_null=True)


class PasswordChangeSerializer(serializers.Serializer):
    """비밀번호 변경 시리얼라이저"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )


class UserDeleteSerializer(serializers.Serializer):
    """회원 탈퇴 시리얼라이저"""
    password = serializers.CharField(required=True, write_only=True)


class PasswordResetSerializer(serializers.Serializer):
    """비밀번호 찾기 시리얼라이저"""
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """비밀번호 재설정 시리얼라이저"""
    token = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )

