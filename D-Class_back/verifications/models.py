from django.db import models
from django.conf import settings


class VerificationFile(models.Model):
    """인증 서류 파일"""
    
    file = models.FileField(
        upload_to='verifications/',
        verbose_name='파일'
    )
    file_name = models.CharField(max_length=255, verbose_name='파일명')
    file_size = models.PositiveIntegerField(verbose_name='파일 크기')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='업로드일')
    
    class Meta:
        verbose_name = '인증 서류 파일'
        verbose_name_plural = '인증 서류 파일'
    
    def __str__(self):
        return self.file_name


class InstructorVerification(models.Model):
    """강사 인증 서류"""
    
    STATUS_CHOICES = [
        ('pending', '인증 대기'),
        ('approved', '인증 완료'),
        ('rejected', '인증 반려'),
    ]
    
    instructor = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='instructor_verification',
        verbose_name='강사',
        limit_choices_to={'role': 'instructor'}
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='상태'
    )
    files = models.ManyToManyField(
        VerificationFile,
        related_name='instructor_verifications',
        verbose_name='서류 파일'
    )
    rejection_reason = models.TextField(
        blank=True,
        verbose_name='반려 사유'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='신청일')
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name='검토일')
    
    class Meta:
        verbose_name = '강사 인증'
        verbose_name_plural = '강사 인증'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.instructor.name} - {self.get_status_display()}'


class AcademyVerification(models.Model):
    """학원 인증 서류"""
    
    STATUS_CHOICES = [
        ('pending', '인증 대기'),
        ('approved', '인증 완료'),
        ('rejected', '인증 반려'),
    ]
    
    academy = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='academy_verification',
        verbose_name='학원',
        limit_choices_to={'role': 'academy'}
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='상태'
    )
    file = models.OneToOneField(
        VerificationFile,
        on_delete=models.CASCADE,
        related_name='academy_verification',
        verbose_name='사업자등록증'
    )
    rejection_reason = models.TextField(
        blank=True,
        verbose_name='반려 사유'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='신청일')
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name='검토일')
    
    class Meta:
        verbose_name = '학원 인증'
        verbose_name_plural = '학원 인증'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.academy.name} - {self.get_status_display()}'
