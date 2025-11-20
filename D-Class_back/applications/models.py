from django.db import models
from django.conf import settings


class Application(models.Model):
    """지원"""
    
    STATUS_CHOICES = [
        ('pending', '지원 완료'),  # 강사 관점: 지원 완료 / 학원 관점: 새 지원
        ('reviewing', '검토중'),
        ('accepted', '최종 합격'),  # 강사 관점: 최종 합격 / 학원 관점: 채용 확정
        ('rejected', '불합격'),
    ]
    
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications',
        verbose_name='강사',
        limit_choices_to={'role': 'instructor'}
    )
    job_posting = models.ForeignKey(
        'job_postings.JobPosting',
        on_delete=models.CASCADE,
        related_name='applications',
        verbose_name='공고'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='상태'
    )
    rejection_reason = models.TextField(
        blank=True,
        verbose_name='불합격 사유'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='지원일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '지원'
        verbose_name_plural = '지원'
        ordering = ['-created_at']
        unique_together = ['instructor', 'job_posting']  # 중복 지원 방지
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['job_posting', 'status']),
        ]
    
    def __str__(self):
        return f'{self.instructor.name} - {self.job_posting.title}'
