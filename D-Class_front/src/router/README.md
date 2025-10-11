# 라우팅 구조

## 📁 라우트 구조 개요

### 인증 라우트 (`/`)
- `/login` - 로그인
- `/signup` - 회원가입 (역할 선택)
- `/signup/info` - 회원가입 (정보 입력)

### 강사 라우트 (`/instructor/*`)
**레이아웃:** InstructorLayout (상단 헤더 + 하단 네비게이션)

- `/instructor/jobs` - 공고 목록 (홈)
- `/instructor/jobs/:id` - 공고 상세
- `/instructor/applications` - 지원 현황
- `/instructor/favorites` - 찜한 공고
- `/instructor/profile` - 마이페이지
- `/instructor/profile/edit` - 프로필 관리
- `/instructor/verification` - 인증 서류 제출
- `/instructor/reviews` - 내가 작성한 리뷰
- `/instructor/reviews/write/:academyId` - 리뷰 작성

### 학원 라우트 (`/academy/*`)
**레이아웃:** AcademyLayout (상단 헤더 + 하단 네비게이션)

- `/academy/jobs` - 공고 관리
- `/academy/jobs/create` - 공고 등록
- `/academy/jobs/:id` - 공고 상세
- `/academy/jobs/:id/edit` - 공고 수정
- `/academy/applicants` - 지원자 관리
- `/academy/applicants/:id` - 지원자 상세
- `/academy/hired` - 채용 현황
- `/academy/reviews` - 리뷰 관리
- `/academy/reviews/write/:instructorId` - 리뷰 작성
- `/academy/profile` - 학원 관리
- `/academy/profile/edit` - 학원 정보 관리
- `/academy/verification` - 사업자 인증

### 관리자 라우트 (`/admin/*`)
**레이아웃:** AdminLayout (사이드 네비게이션 + 메인 컨텐츠)

- `/admin/dashboard` - 대시보드
- `/admin/members` - 회원 관리
- `/admin/verifications` - 인증 관리
- `/admin/jobs` - 공고 관리
- `/admin/reviews` - 리뷰 관리
- `/admin/inquiries` - 문의/신고 관리

### 공통 라우트
- `/search` - 검색
- `/notifications` - 알림
- `/settings` - 설정
- `/settings/account` - 계정 설정
- `/settings/notifications` - 알림 설정
- `/support` - 고객센터
- `/academy/:id` - 학원 공개 프로필

### 에러 페이지
- `/error/404` - 페이지를 찾을 수 없음
- `/error/500` - 서버 오류
- `/error/network` - 네트워크 오류
- `/maintenance` - 서비스 점검 중

## 🛡️ 라우트 가드

### requireGuest
- **대상:** 로그인 안된 사용자만 접근 가능
- **적용:** `/login`, `/signup` 등
- **동작:** 로그인 상태면 역할별 홈으로 리다이렉트

### requireAuth
- **대상:** 로그인한 사용자만 접근 가능
- **적용:** 모든 인증 필요 페이지
- **동작:** 미로그인 시 `/login`으로 리다이렉트 (원래 URL 저장)

### requireInstructor
- **대상:** 강사 역할만 접근 가능
- **적용:** `/instructor/*` 모든 라우트
- **동작:** 다른 역할이면 해당 역할의 홈으로 리다이렉트

### requireAcademy
- **대상:** 학원 역할만 접근 가능
- **적용:** `/academy/*` 모든 라우트
- **동작:** 다른 역할이면 해당 역할의 홈으로 리다이렉트

### requireAdmin
- **대상:** 관리자 역할만 접근 가능
- **적용:** `/admin/*` 모든 라우트
- **동작:** 다른 역할이면 해당 역할의 홈으로 리다이렉트

## 🔄 리다이렉션 규칙

### 로그인 후
- **강사:** `/instructor/jobs`
- **학원:** `/academy/jobs`
- **관리자:** `/admin/dashboard`

### 권한 없는 페이지 접근 시
- 자동으로 해당 역할의 홈으로 리다이렉트

### 루트 접근 (`/`)
- 로그인 안됨: `/login`
- 로그인 됨: 역할별 홈

## 📱 메타 정보

### meta.title
- 페이지 타이틀 설정
- 자동으로 `{title} - D-Class` 형식으로 표시

### meta.layout
- 사용할 레이아웃 지정
- `instructor`, `academy`, `admin` 중 선택

## 🎯 스크롤 동작

### 새 페이지 이동 시
- 항상 페이지 최상단으로 스크롤

### 뒤로가기 시
- 이전 스크롤 위치 복원

## 🔍 사용 예시

### 라우터 네비게이션
```javascript
// 페이지 이동
router.push('/instructor/jobs')

// 파라미터와 함께 이동
router.push({ 
  name: 'InstructorJobDetail', 
  params: { id: 123 } 
})

// 쿼리 파라미터와 함께 이동
router.push({ 
  path: '/search', 
  query: { keyword: '발레' } 
})
```

### 현재 라우트 정보
```javascript
import { useRoute } from 'vue-router'

const route = useRoute()
console.log(route.params.id)
console.log(route.query.keyword)
console.log(route.meta.title)
```

### 프로그래매틱 네비게이션
```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToJobDetail = (id) => {
  router.push(`/instructor/jobs/${id}`)
}

const goBack = () => {
  router.back()
}
</script>
```

## 🚨 에러 처리

### 라우터 에러
- 자동으로 콘솔에 로깅
- TODO: 에러 로깅 서비스 연동

### 404 처리
- 잘못된 경로는 `/error/404`로 리다이렉트

## 📝 주의사항

1. **라우트 가드:** 페이지별로 적절한 가드 적용 필수
2. **메타 정보:** title과 layout 설정 권장
3. **인증 토큰:** localStorage에서 토큰 확인
4. **역할 확인:** userInfo의 role 필드 사용
5. **리다이렉트:** 로그인 후 원래 URL로 복귀 (redirect 쿼리)

