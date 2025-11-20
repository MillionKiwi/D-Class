from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Custom user manager"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user"""
        if not email:
            raise ValueError('이메일은 필수입니다.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User Model"""
    
    ROLE_CHOICES = [
        ('instructor', '강사'),
        ('academy', '학원'),
        ('admin', '관리자'),
    ]
    
    email = models.EmailField(unique=True, verbose_name='이메일')
    name = models.CharField(max_length=50, verbose_name='이름')
    phone = models.CharField(max_length=20, verbose_name='전화번호')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, verbose_name='역할')
    
    is_verified = models.BooleanField(default=False, verbose_name='인증 완료')
    verification_status = models.CharField(
        max_length=20,
        choices=[
            ('none', '미인증'),
            ('pending', '인증 대기'),
            ('approved', '인증 완료'),
            ('rejected', '인증 반려'),
        ],
        default='none',
        verbose_name='인증 상태'
    )
    
    is_active = models.BooleanField(default=True, verbose_name='활성화')
    is_staff = models.BooleanField(default=False, verbose_name='스태프')
    date_joined = models.DateTimeField(default=timezone.now, verbose_name='가입일')
    
    # 비밀번호 재설정용 필드
    password_reset_token = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        verbose_name='비밀번호 재설정 토큰'
    )
    password_reset_token_expires = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='비밀번호 재설정 토큰 만료일'
    )
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'phone']
    
    class Meta:
        verbose_name = '사용자'
        verbose_name_plural = '사용자'
        ordering = ['-date_joined']
    
    def __str__(self):
        return f'{self.name} ({self.email})'
