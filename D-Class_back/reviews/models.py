from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Review(models.Model):
    """리뷰"""
    
    RATING_CHOICES = [
        (1, '1점'),
        (2, '2점'),
        (3, '3점'),
        (4, '4점'),
        (5, '5점'),
    ]
    
    # 리뷰 작성자
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_written',
        verbose_name='작성자'
    )
    # 리뷰 대상 (강사 또는 학원)
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='instructor_reviews_received',
        null=True,
        blank=True,
        verbose_name='강사',
        limit_choices_to={'role': 'instructor'}
    )
    academy = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='academy_reviews_received',
        null=True,
        blank=True,
        verbose_name='학원',
        limit_choices_to={'role': 'academy'}
    )
    # 관련 지원 (리뷰는 채용 확정된 지원에 대해서만 작성 가능)
    application = models.ForeignKey(
        'applications.Application',
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name='지원',
        null=True,
        blank=True
    )
    rating = models.IntegerField(
        choices=RATING_CHOICES,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='평점'
    )
    content = models.TextField(verbose_name='리뷰 내용')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='작성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '리뷰'
        verbose_name_plural = '리뷰'
        ordering = ['-created_at']
        constraints = [
            # 강사 또는 학원 중 하나만 선택되어야 함
            models.CheckConstraint(
                check=(
                    models.Q(instructor__isnull=False, academy__isnull=True) |
                    models.Q(instructor__isnull=True, academy__isnull=False)
                ),
                name='review_target_check'
            ),
        ]
        indexes = [
            models.Index(fields=['instructor', '-created_at']),
            models.Index(fields=['academy', '-created_at']),
        ]
    
    def __str__(self):
        target = self.instructor.name if self.instructor else self.academy.name
        return f'{self.author.name}의 리뷰 - {target}'
