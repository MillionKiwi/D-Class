from rest_framework import serializers
from .models import Board, Post, PostImage
from users.models import User


class PostImageSerializer(serializers.ModelSerializer):
    """게시글 이미지 시리얼라이저"""
    
    class Meta:
        model = PostImage
        fields = ['id', 'image', 'order']
        read_only_fields = ['id']


class AuthorSerializer(serializers.ModelSerializer):
    """작성자 정보 시리얼라이저"""
    profile_image = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'name', 'profile_image', 'is_verified']
    
    def get_profile_image(self, obj):
        if hasattr(obj, 'instructor_profile') and obj.instructor_profile.profile_image:
            return obj.instructor_profile.profile_image.url
        elif hasattr(obj, 'academy_profile') and obj.academy_profile.academy_image:
            return obj.academy_profile.academy_image.url
        return None


class PostListSerializer(serializers.ModelSerializer):
    """게시글 목록 시리얼라이저"""
    author = AuthorSerializer(read_only=True)
    thumbnail = serializers.SerializerMethodField()
    images_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'author', 'thumbnail', 'views',
            'images_count', 'comments_count', 'created_at'
        ]
    
    def get_thumbnail(self, obj):
        first_image = obj.images.first()
        if first_image:
            return first_image.image.url
        return None
    
    def get_images_count(self, obj):
        return obj.images.count()
    
    def get_comments_count(self, obj):
        # 추후 댓글 기능 구현 시 사용
        return 0


class PostDetailSerializer(serializers.ModelSerializer):
    """게시글 상세 시리얼라이저"""
    author = AuthorSerializer(read_only=True)
    images = PostImageSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    is_author = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'author', 'images',
            'views', 'comments_count', 'is_author',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['views', 'created_at', 'updated_at']
    
    def get_comments_count(self, obj):
        # 추후 댓글 기능 구현 시 사용
        return 0
    
    def get_is_author(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.author == request.user
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    """게시글 작성 시리얼라이저"""
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        allow_empty=True,
        write_only=True
    )
    
    class Meta:
        model = Post
        fields = ['board', 'title', 'content', 'images']
    
    def validate_title(self, value):
        if len(value.strip()) == 0:
            raise serializers.ValidationError('제목을 입력해주세요')
        return value.strip()
    
    def validate_content(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError('내용은 최소 10자 이상 입력해주세요')
        return value.strip()
    
    def create(self, validated_data):
        images = validated_data.pop('images', [])
        validated_data['author'] = self.context['request'].user
        
        # 기본 게시판 설정 (발레 작품 이야기)
        if 'board' not in validated_data or not validated_data.get('board'):
            board, _ = Board.objects.get_or_create(
                name='발레 작품 이야기',
                defaults={'description': '발레 작품 해설을 공유하는 게시판입니다'}
            )
            validated_data['board'] = board
        
        post = super().create(validated_data)
        
        # 이미지 저장 (최대 5개)
        for index, image in enumerate(images[:5]):
            PostImage.objects.create(
                post=post,
                image=image,
                order=index
            )
        
        return post


class PostUpdateSerializer(serializers.ModelSerializer):
    """게시글 수정 시리얼라이저"""
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        allow_empty=True,
        write_only=True
    )
    delete_image_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
        write_only=True
    )
    
    class Meta:
        model = Post
        fields = ['title', 'content', 'images', 'delete_image_ids']
    
    def validate_title(self, value):
        if len(value.strip()) == 0:
            raise serializers.ValidationError('제목을 입력해주세요')
        return value.strip()
    
    def validate_content(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError('내용은 최소 10자 이상 입력해주세요')
        return value.strip()
    
    def update(self, instance, validated_data):
        images = validated_data.pop('images', [])
        delete_image_ids = validated_data.pop('delete_image_ids', [])
        
        # 이미지 삭제
        if delete_image_ids:
            PostImage.objects.filter(
                post=instance,
                id__in=delete_image_ids
            ).delete()
        
        # 새 이미지 추가
        existing_images_count = instance.images.count()
        for index, image in enumerate(images):
            PostImage.objects.create(
                post=instance,
                image=image,
                order=existing_images_count + index
            )
        
        return super().update(instance, validated_data)


class BoardSerializer(serializers.ModelSerializer):
    """게시판 시리얼라이저"""
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Board
        fields = ['id', 'name', 'description', 'posts_count', 'is_active']
    
    def get_posts_count(self, obj):
        return obj.posts.count()

