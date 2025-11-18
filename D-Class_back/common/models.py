from django.db import models


class Term(models.Model):
    """이용약관 및 개인정보처리방침"""
    
    TYPE_CHOICES = [
        ('service', '이용약관'),
        ('privacy', '개인정보처리방침'),
    ]
    
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        unique=True,
        verbose_name='유형'
    )
    title = models.CharField(max_length=200, verbose_name='제목')
    content = models.TextField(verbose_name='내용')
    version = models.CharField(max_length=20, default='1.0', verbose_name='버전')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '약관'
        verbose_name_plural = '약관'
    
    def __str__(self):
        return f'{self.get_type_display()} - v{self.version}'


class FAQCategory(models.Model):
    """FAQ 카테고리"""
    
    name = models.CharField(max_length=50, verbose_name='카테고리명')
    order = models.PositiveIntegerField(default=0, verbose_name='순서')
    
    class Meta:
        verbose_name = 'FAQ 카테고리'
        verbose_name_plural = 'FAQ 카테고리'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class FAQ(models.Model):
    """FAQ"""
    
    category = models.ForeignKey(
        FAQCategory,
        on_delete=models.CASCADE,
        related_name='faqs',
        verbose_name='카테고리'
    )
    question = models.CharField(max_length=200, verbose_name='질문')
    answer = models.TextField(verbose_name='답변')
    order = models.PositiveIntegerField(default=0, verbose_name='순서')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQ'
        ordering = ['category', 'order', 'question']
    
    def __str__(self):
        return self.question


class Inquiry(models.Model):
    """1:1 문의"""
    
    CATEGORY_CHOICES = [
        ('account', '계정'),
        ('verification', '인증'),
        ('posting', '공고'),
        ('application', '지원'),
        ('payment', '결제'),
        ('etc', '기타'),
    ]
    
    STATUS_CHOICES = [
        ('pending', '대기'),
        ('processing', '처리중'),
        ('completed', '완료'),
    ]
    
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='inquiries',
        verbose_name='사용자'
    )
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        verbose_name='카테고리'
    )
    title = models.CharField(max_length=200, verbose_name='제목')
    content = models.TextField(verbose_name='내용')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='상태'
    )
    answer = models.TextField(blank=True, verbose_name='답변')
    answered_at = models.DateTimeField(null=True, blank=True, verbose_name='답변일')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='문의일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '문의'
        verbose_name_plural = '문의'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user.name} - {self.title}'
