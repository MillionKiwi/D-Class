from django.db import models
from django.conf import settings
from django.core.validators import MaxLengthValidator


class InstructorProfile(models.Model):
    """강사 프로필"""
    
    GENRE_CHOICES = [
        ('ballet', '발레'),
        ('contemporary', '현대무용'),
        ('korean', '한국무용'),
        ('jazz', '재즈댄스'),
        ('hiphop', '힙합'),
        ('ballroom', '볼룸댄스'),
        ('etc', '기타'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='instructor_profile',
        verbose_name='사용자'
    )
    profile_image = models.ImageField(
        upload_to='instructors/profile/',
        null=True,
        blank=True,
        verbose_name='프로필 이미지'
    )
    specialties = models.JSONField(
        default=list,
        verbose_name='전문 분야',
        help_text='무용 장르 리스트'
    )
    bio = models.TextField(
        max_length=500,
        blank=True,
        validators=[MaxLengthValidator(500)],
        verbose_name='자기소개'
    )
    contact_visible = models.BooleanField(
        default=False,
        verbose_name='연락처 공개'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '강사 프로필'
        verbose_name_plural = '강사 프로필'
    
    def __str__(self):
        return f'{self.user.name}의 프로필'


class Experience(models.Model):
    """강사 경력"""
    
    instructor = models.ForeignKey(
        InstructorProfile,
        on_delete=models.CASCADE,
        related_name='experiences',
        verbose_name='강사'
    )
    institution = models.CharField(max_length=100, verbose_name='기관명')
    position = models.CharField(max_length=50, verbose_name='직책')
    start_date = models.DateField(verbose_name='시작일')
    end_date = models.DateField(null=True, blank=True, verbose_name='종료일')
    description = models.TextField(blank=True, verbose_name='설명')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '경력'
        verbose_name_plural = '경력'
        ordering = ['-start_date']
    
    def __str__(self):
        return f'{self.institution} - {self.position}'


class Education(models.Model):
    """강사 학력"""
    
    DEGREE_CHOICES = [
        ('bachelor', '학사'),
        ('master', '석사'),
        ('doctor', '박사'),
        ('etc', '기타'),
    ]
    
    instructor = models.ForeignKey(
        InstructorProfile,
        on_delete=models.CASCADE,
        related_name='educations',
        verbose_name='강사'
    )
    school = models.CharField(max_length=100, verbose_name='학교명')
    major = models.CharField(max_length=100, verbose_name='전공')
    degree = models.CharField(
        max_length=20,
        choices=DEGREE_CHOICES,
        verbose_name='학위'
    )
    start_date = models.DateField(verbose_name='입학일')
    end_date = models.DateField(null=True, blank=True, verbose_name='졸업일')
    description = models.TextField(blank=True, verbose_name='설명')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '학력'
        verbose_name_plural = '학력'
        ordering = ['-start_date']
    
    def __str__(self):
        return f'{self.school} - {self.major}'
