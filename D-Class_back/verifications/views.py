from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.uploadedfile import InMemoryUploadedFile
from .models import InstructorVerification, AcademyVerification, VerificationFile
from .serializers import (
    InstructorVerificationSerializer,
    AcademyVerificationSerializer,
    VerificationFileSerializer
)


class InstructorVerificationView(generics.CreateAPIView, generics.RetrieveAPIView):
    """강사 인증 서류 제출"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = InstructorVerificationSerializer
    
    def get_object(self):
        verification, created = InstructorVerification.objects.get_or_create(
            instructor=self.request.user
        )
        return verification
    
    def post(self, request, *args, **kwargs):
        if request.user.role != 'instructor':
            return Response(
                {'detail': '강사만 접근 가능합니다'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        files = request.FILES.getlist('files')
        
        if not files:
            return Response(
                {'files': ['파일을 업로드해주세요']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 파일 검증
        for file in files:
            if file.size > 10 * 1024 * 1024:  # 10MB
                return Response(
                    {'files': ['파일 크기는 10MB 이하만 가능합니다']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not file.name.lower().endswith(('.jpg', '.jpeg', '.png', '.pdf')):
                return Response(
                    {'detail': 'JPG, PNG, PDF 파일만 업로드 가능합니다'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # 인증 객체 생성 또는 가져오기
        verification, created = InstructorVerification.objects.get_or_create(
            instructor=request.user
        )
        
        # 기존 파일 삭제 (재제출인 경우)
        if not created:
            verification.files.all().delete()
        
        # 파일 저장
        file_objects = []
        for file in files:
            file_obj = VerificationFile.objects.create(
                file=file,
                file_name=file.name,
                file_size=file.size
            )
            verification.files.add(file_obj)
            file_objects.append(file_obj)
        
        verification.status = 'pending'
        verification.save()
        
        # 사용자 인증 상태 업데이트
        request.user.verification_status = 'pending'
        request.user.save()
        
        serializer = self.get_serializer(verification)
        return Response({
            'id': verification.id,
            'status': verification.status,
            'message': '인증 신청이 완료되었습니다. 검토까지 1-2일 소요됩니다',
            'files': VerificationFileSerializer(file_objects, many=True).data,
            'created_at': verification.created_at
        }, status=status.HTTP_201_CREATED)


class InstructorVerificationMeView(generics.RetrieveAPIView):
    """강사 인증 상태 조회"""
    permission_classes = [IsAuthenticated]
    serializer_class = InstructorVerificationSerializer
    
    def get_object(self):
        if self.request.user.role != 'instructor':
            return None
        verification, created = InstructorVerification.objects.get_or_create(
            instructor=self.request.user
        )
        return verification


class InstructorVerificationResubmitView(generics.GenericAPIView):
    """강사 인증 서류 재제출"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        if request.user.role != 'instructor':
            return Response(
                {'detail': '강사만 접근 가능합니다'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            verification = InstructorVerification.objects.get(instructor=request.user)
        except InstructorVerification.DoesNotExist:
            return Response(
                {'detail': '인증 신청 내역이 없습니다'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if verification.status != 'rejected':
            return Response(
                {'detail': '재제출 가능한 상태가 아닙니다'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # InstructorVerificationView의 post 로직 재사용
        view = InstructorVerificationView()
        view.request = request
        return view.post(request)


class AcademyVerificationView(generics.CreateAPIView, generics.RetrieveAPIView):
    """학원 인증 서류 제출"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = AcademyVerificationSerializer
    
    def get_object(self):
        verification, created = AcademyVerification.objects.get_or_create(
            academy=self.request.user
        )
        return verification
    
    def post(self, request, *args, **kwargs):
        if request.user.role != 'academy':
            return Response(
                {'detail': '학원만 접근 가능합니다'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        file = request.FILES.get('file')
        
        if not file:
            return Response(
                {'file': ['파일을 업로드해주세요']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 파일 검증
        if file.size > 10 * 1024 * 1024:  # 10MB
            return Response(
                {'file': ['파일 크기는 10MB 이하만 가능합니다']},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not file.name.lower().endswith(('.jpg', '.jpeg', '.png', '.pdf')):
            return Response(
                {'detail': 'JPG, PNG, PDF 파일만 업로드 가능합니다'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 인증 객체 생성 또는 가져오기
        verification, created = AcademyVerification.objects.get_or_create(
            academy=request.user
        )
        
        # 기존 파일 삭제 (재제출인 경우)
        if not created and verification.file:
            verification.file.delete()
        
        # 파일 저장
        file_obj = VerificationFile.objects.create(
            file=file,
            file_name=file.name,
            file_size=file.size
        )
        verification.file = file_obj
        verification.status = 'pending'
        verification.save()
        
        # 사용자 인증 상태 업데이트
        request.user.verification_status = 'pending'
        request.user.save()
        
        serializer = self.get_serializer(verification)
        return Response({
            'id': verification.id,
            'status': verification.status,
            'message': '인증 신청이 완료되었습니다. 검토까지 1-2일 소요됩니다',
            'created_at': verification.created_at
        }, status=status.HTTP_201_CREATED)


class AcademyVerificationMeView(generics.RetrieveAPIView):
    """학원 인증 상태 조회"""
    permission_classes = [IsAuthenticated]
    serializer_class = AcademyVerificationSerializer
    
    def get_object(self):
        if self.request.user.role != 'academy':
            return None
        verification, created = AcademyVerification.objects.get_or_create(
            academy=self.request.user
        )
        return verification
