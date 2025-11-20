from django.db import models
from django.conf import settings
from django.core.validators import MaxLengthValidator


class Board(models.Model):
    """게시판 카테고리"""
    
    name = models.CharField(max_length=100, unique=True, verbose_name='게시판 이름')
    description = models.TextField(blank=True, verbose_name='설명')
    is_active = models.BooleanField(default=True, verbose_name='활성화')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '게시판'
        verbose_name_plural = '게시판'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Post(models.Model):
    """게시글"""
    
    board = models.ForeignKey(
        Board,
        on_delete=models.CASCADE,
        related_name='posts',
        verbose_name='게시판'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='board_posts',
        verbose_name='작성자'
    )
    title = models.CharField(max_length=100, verbose_name='제목')
    content = models.TextField(
        validators=[MaxLengthValidator(5000)],
        verbose_name='내용'
    )
    views = models.PositiveIntegerField(default=0, verbose_name='조회수')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='작성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '게시글'
        verbose_name_plural = '게시글'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['board', '-created_at']),
            models.Index(fields=['author', '-created_at']),
        ]
    
    def __str__(self):
        return f'{self.title} - {self.author.name}'


class PostImage(models.Model):
    """게시글 이미지"""
    
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='게시글'
    )
    image = models.ImageField(
        upload_to='boards/posts/',
        verbose_name='이미지'
    )
    order = models.PositiveIntegerField(default=0, verbose_name='순서')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    
    class Meta:
        verbose_name = '게시글 이미지'
        verbose_name_plural = '게시글 이미지'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f'{self.post.title} - 이미지 {self.order + 1}'
