from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from job_postings.models import JobPosting
from django.db.models import Q


class SearchAutocompleteView(generics.GenericAPIView):
    """검색어 자동완성"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        
        if not query or len(query) < 2:
            return Response({'suggestions': []})
        
        suggestions = []
        
        # 공고 제목에서 검색
        postings = JobPosting.objects.filter(
            title__icontains=query,
            status='active'
        ).values_list('title', flat=True).distinct()[:5]
        
        for title in postings:
            if query.lower() in title.lower():
                suggestions.append(title)
        
        # 학원명에서 검색
        from academies.models import AcademyProfile
        academies = AcademyProfile.objects.filter(
            academy_name__icontains=query
        ).values_list('academy_name', flat=True).distinct()[:3]
        
        for name in academies:
            if query.lower() in name.lower():
                suggestions.append(name)
        
        # 지역에서 검색
        regions = {
            '서울': 'seoul',
            '경기': 'gyeonggi',
            '인천': 'incheon',
            '부산': 'busan',
            '강남': 'gangnam',
            '강북': 'gangbuk'
        }
        
        for region_name, region_code in regions.items():
            if query in region_name:
                suggestions.append(region_name)
        
        # 중복 제거 및 정렬
        suggestions = list(set(suggestions))[:10]
        
        return Response({'suggestions': suggestions})


class SearchPopularView(generics.GenericAPIView):
    """인기 검색어 조회"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        # 실제로는 검색 로그를 분석하여 인기 검색어를 제공
        # 여기서는 샘플 데이터 반환
        keywords = [
            {'keyword': '발레 강사', 'count': 150},
            {'keyword': '서울 강남', 'count': 120},
            {'keyword': '현대무용', 'count': 100},
            {'keyword': '주말 강사', 'count': 80},
            {'keyword': '한국무용', 'count': 60},
        ]
        
        return Response({'keywords': keywords})

