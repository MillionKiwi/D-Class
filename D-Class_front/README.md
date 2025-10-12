# D-Class 프론트엔드

댄스 강사와 학원을 연결하는 매칭 플랫폼 D-Class의 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택

- **프레임워크**: Vue 3 (Composition API)
- **상태 관리**: Pinia
- **라우팅**: Vue Router
- **HTTP 클라이언트**: Axios
- **스타일링**: SCSS
- **아이콘**: Lucide Vue Next
- **빌드 도구**: Vite
- **PWA**: Service Worker

## 📦 프로젝트 구조

```
src/
├── api/              # API 통신
├── assets/           # 정적 자산
│   └── styles/       # 전역 스타일
├── components/       # Vue 컴포넌트
│   ├── common/       # 공통 컴포넌트
│   └── layout/       # 레이아웃 컴포넌트
├── composables/      # Composition API
├── router/           # 라우터 설정
├── stores/           # Pinia 스토어
├── utils/            # 유틸리티 함수
└── views/            # 페이지 컴포넌트
    ├── auth/         # 인증 페이지
    ├── instructor/   # 강사 페이지
    ├── academy/      # 학원 페이지
    ├── admin/        # 관리자 페이지
    ├── common/       # 공통 페이지
    └── error/        # 에러 페이지
```

## 🛠️ 설치 및 실행

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 파일 확인 (이미 생성되어 있습니다)
# .env.development - 개발 환경
# .env.production - 프로덕션 환경
# 필요시 각 파일의 값을 수정하세요

# 개발 서버 실행
npm run dev
```

> 📝 **환경변수 설정**: 자세한 내용은 [ENV_GUIDE.md](./ENV_GUIDE.md)를 참고하세요.

### 빌드

```bash
# 개발 빌드
npm run build

# 프로덕션 빌드
npm run build:prod

# 빌드 미리보기
npm run preview
```

### 배포

```bash
# 개발 서버 배포
npm run deploy:dev

# 프로덕션 배포
npm run deploy:prod
```

## 🎨 주요 기능

### 사용자 역할

1. **강사 (Instructor)**
   - 공고 검색 및 열람
   - 공고 지원
   - 프로필 관리
   - 리뷰 작성

2. **학원 (Academy)**
   - 공고 등록 및 관리
   - 지원자 관리
   - 채용 확정
   - 강사 리뷰 작성

3. **관리자 (Admin)**
   - 회원 관리
   - 인증 서류 검토
   - 리뷰 관리
   - 문의/신고 처리

### 핵심 기능

- 🔐 JWT 기반 인증
- 🔍 실시간 검색 (디바운싱)
- 📱 반응형 디자인 (모바일 우선)
- 🎯 역할 기반 접근 제어
- 💬 실시간 알림
- ⭐ 리뷰 시스템
- 📤 이미지 업로드
- 🌐 PWA 지원

## 🔧 환경 변수

환경변수 파일은 이미 생성되어 있습니다:

- `.env.example` - 예제 파일 (Git에 포함)
- `.env.development` - 개발 환경 설정
- `.env.production` - 프로덕션 환경 설정

### 주요 환경변수

```env
# API 설정
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=10000

# 앱 정보
VITE_APP_ENV=development
VITE_APP_NAME=D-Class
VITE_APP_VERSION=1.0.0

# 파일 업로드 설정 (10MB)
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# 디버그 설정
VITE_DEBUG_MODE=true
VITE_LOG_API=true
```

> 📚 **상세 가이드**: 전체 환경변수 목록과 사용법은 [ENV_GUIDE.md](./ENV_GUIDE.md)를 참고하세요.

## 📱 PWA

이 애플리케이션은 Progressive Web App으로 구현되어 있습니다:

- 오프라인 지원
- 홈 화면에 추가 가능
- 푸시 알림 (선택사항)
- 빠른 로딩 속도

## 🎨 디자인 시스템

### 컬러 팔레트

- **Primary**: `#6366F1` (Serene Blue)
- **Secondary**: `#10B981` (Emerald Green)
- **Accent**: `#F59E0B` (Warm Yellow)
- **Background**: `#F8F9FA`

### 타이포그래피

- **폰트**: Pretendard Variable
- **기본 크기**: 16px
- **줄 높이**: 1.6

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 👥 기여

기여를 환영합니다! 이슈를 생성하거나 Pull Request를 보내주세요.

## 📞 문의

- 이메일: support@d-class.com
- 웹사이트: https://d-class.com
