from django.db import models
from django.conf import settings


class NotificationSettings(models.Model):
    """알림 설정"""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_settings',
        verbose_name='사용자'
    )
    application_result = models.BooleanField(
        default=True,
        verbose_name='지원 결과 알림'
    )
    verification_result = models.BooleanField(
        default=True,
        verbose_name='인증 결과 알림'
    )
    new_posting = models.BooleanField(
        default=True,
        verbose_name='새 공고 알림'
    )
    marketing = models.BooleanField(
        default=False,
        verbose_name='마케팅 알림'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '알림 설정'
        verbose_name_plural = '알림 설정'
    
    def __str__(self):
        return f'{self.user.name}의 알림 설정'


class Notification(models.Model):
    """알림"""
    
    TYPE_CHOICES = [
        ('application_accepted', '지원 합격'),
        ('application_rejected', '지원 불합격'),
        ('verification_approved', '인증 승인'),
        ('verification_rejected', '인증 반려'),
        ('new_posting', '새 공고 알림'),
        ('new_application', '새 지원 알림'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='사용자'
    )
    type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        verbose_name='알림 유형'
    )
    title = models.CharField(max_length=200, verbose_name='제목')
    content = models.TextField(verbose_name='내용')
    is_read = models.BooleanField(default=False, verbose_name='읽음 여부')
    related_url = models.CharField(
        max_length=500,
        blank=True,
        verbose_name='관련 URL'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    
    class Meta:
        verbose_name = '알림'
        verbose_name_plural = '알림'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
        ]
    
    def __str__(self):
        return f'{self.user.name} - {self.title}'
