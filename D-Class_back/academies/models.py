from django.db import models
from django.conf import settings
from django.core.validators import MaxLengthValidator


class AcademyProfile(models.Model):
    """학원 프로필"""
    
    GENRE_CHOICES = [
        ('ballet', '발레'),
        ('contemporary', '현대무용'),
        ('korean', '한국무용'),
        ('jazz', '재즈댄스'),
        ('hiphop', '힙합'),
        ('ballroom', '볼룸댄스'),
        ('etc', '기타'),
    ]
    
    FACILITY_CHOICES = [
        ('parking', '주차장'),
        ('shower', '샤워실'),
        ('locker', '락커'),
        ('cafe', '카페'),
        ('waiting', '대기실'),
        ('etc', '기타'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='academy_profile',
        verbose_name='사용자'
    )
    academy_name = models.CharField(max_length=100, verbose_name='학원명')
    academy_image = models.ImageField(
        upload_to='academies/profile/',
        null=True,
        blank=True,
        verbose_name='학원 이미지'
    )
    address = models.CharField(max_length=200, verbose_name='주소')
    phone = models.CharField(max_length=20, blank=True, verbose_name='전화번호')
    operating_hours = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='운영 시간',
        help_text='예: 09:00-18:00'
    )
    main_genres = models.JSONField(
        default=list,
        verbose_name='주요 장르',
        help_text='무용 장르 리스트'
    )
    description = models.TextField(
        max_length=1000,
        blank=True,
        validators=[MaxLengthValidator(1000)],
        verbose_name='학원 소개'
    )
    facilities = models.JSONField(
        default=list,
        verbose_name='편의시설',
        help_text='편의시설 리스트'
    )
    # 지도 좌표 (PostGIS 사용 시 PointField로 변경 가능)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name='위도'
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name='경도'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '학원 프로필'
        verbose_name_plural = '학원 프로필'
    
    def __str__(self):
        return self.academy_name
