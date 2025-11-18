from django.db import models
from django.conf import settings


class Favorite(models.Model):
    """찜한 공고"""
    
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name='강사',
        limit_choices_to={'role': 'instructor'}
    )
    job_posting = models.ForeignKey(
        'job_postings.JobPosting',
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name='공고'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='찜한 날짜')
    
    class Meta:
        verbose_name = '찜'
        verbose_name_plural = '찜'
        unique_together = ['instructor', 'job_posting']  # 중복 찜 방지
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['instructor', '-created_at']),
        ]
    
    def __str__(self):
        return f'{self.instructor.name} - {self.job_posting.title}'
