from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class JobPosting(models.Model):
    """구인 공고"""
    
    STATUS_CHOICES = [
        ('draft', '작성중'),
        ('pending', '검토 대기'),
        ('active', '게시중'),
        ('closed', '마감'),
        ('hidden', '숨김'),
        ('deleted', '삭제'),
    ]
    
    REGION_CHOICES = [
        ('seoul', '서울'),
        ('gyeonggi', '경기'),
        ('incheon', '인천'),
        ('busan', '부산'),
        ('etc', '기타'),
    ]
    
    SALARY_TYPE_CHOICES = [
        ('hourly', '시급'),
        ('monthly', '월급'),
    ]
    
    DAY_CHOICES = [
        ('monday', '월요일'),
        ('tuesday', '화요일'),
        ('wednesday', '수요일'),
        ('thursday', '목요일'),
        ('friday', '금요일'),
        ('saturday', '토요일'),
        ('sunday', '일요일'),
    ]
    
    academy = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='job_postings',
        verbose_name='학원',
        limit_choices_to={'role': 'academy'}
    )
    title = models.CharField(max_length=200, verbose_name='공고 제목')
    region = models.CharField(
        max_length=20,
        choices=REGION_CHOICES,
        verbose_name='지역'
    )
    district = models.CharField(max_length=50, verbose_name='시/구')
    genres = models.JSONField(
        default=list,
        verbose_name='무용 장르',
        help_text='무용 장르 리스트'
    )
    classes = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='담당 수업',
        help_text='예: 초등반, 성인취미반'
    )
    work_days = models.JSONField(
        default=list,
        verbose_name='근무 요일',
        help_text='요일 리스트'
    )
    work_time = models.CharField(
        max_length=50,
        verbose_name='근무 시간',
        help_text='예: 14:00-18:00'
    )
    salary_type = models.CharField(
        max_length=20,
        choices=SALARY_TYPE_CHOICES,
        verbose_name='급여 유형'
    )
    salary = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='급여'
    )
    preferred_qualifications = models.TextField(
        blank=True,
        verbose_name='우대 사항'
    )
    description = models.TextField(verbose_name='상세 설명')
    address = models.CharField(max_length=200, verbose_name='주소')
    # 지도 좌표
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
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='상태'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '구인 공고'
        verbose_name_plural = '구인 공고'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['region', 'district']),
        ]
    
    def __str__(self):
        return f'{self.title} - {self.academy.academy_profile.academy_name if hasattr(self.academy, "academy_profile") else self.academy.name}'
