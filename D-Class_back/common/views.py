from rest_framework import generics, viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Term, FAQCategory, FAQ, Inquiry
from .serializers import (
    TermSerializer,
    FAQCategorySerializer,
    InquirySerializer,
    InquiryCreateSerializer
)


class TermServiceView(generics.RetrieveAPIView):
    """이용약관 조회"""
    permission_classes = [AllowAny]
    serializer_class = TermSerializer
    
    def get_object(self):
        term, created = Term.objects.get_or_create(
            type='service',
            defaults={
                'title': '이용약관',
                'content': '이용약관 내용을 입력해주세요.',
                'version': '1.0'
            }
        )
        return term


class TermPrivacyView(generics.RetrieveAPIView):
    """개인정보처리방침 조회"""
    permission_classes = [AllowAny]
    serializer_class = TermSerializer
    
    def get_object(self):
        term, created = Term.objects.get_or_create(
            type='privacy',
            defaults={
                'title': '개인정보처리방침',
                'content': '개인정보처리방침 내용을 입력해주세요.',
                'version': '1.0'
            }
        )
        return term


class FAQListView(generics.ListAPIView):
    """FAQ 목록 조회"""
    permission_classes = [AllowAny]
    serializer_class = FAQCategorySerializer
    queryset = FAQCategory.objects.prefetch_related('faqs').all()
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'categories': serializer.data
        })


class InquiryViewSet(viewsets.ModelViewSet):
    """문의 관리 ViewSet"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return InquiryCreateSerializer
        return InquirySerializer
    
    def get_queryset(self):
        return Inquiry.objects.filter(user=self.request.user).order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save(user=request.user)
        return Response({
            'id': inquiry.id,
            'message': '문의가 등록되었습니다',
            'created_at': inquiry.created_at
        }, status=status.HTTP_201_CREATED)
