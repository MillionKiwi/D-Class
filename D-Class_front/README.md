# D-Match Frontend

D-Match (디매치) 프론트엔드 프로젝트입니다.

## 기술 스택

- **Vue.js 3** (Composition API)
- **Pinia** (상태 관리)
- **Vue Router** (라우팅)
- **Vite** (빌드 도구)
- **Vite PWA Plugin** (PWA 지원)
- **Axios** (HTTP 클라이언트)

## PWA 지원

이 프로젝트는 **PWA (Progressive Web App)**로 구성되어 있습니다:

- 📱 **오프라인 지원**: Service Worker를 통한 오프라인 캐싱
- 📲 **앱처럼 설치**: 홈 화면에 추가 가능
- 🔄 **자동 업데이트**: 새 버전 자동 감지 및 업데이트
- ⚡ **빠른 로딩**: 캐시된 리소스로 빠른 초기 로딩
- 🔒 **HTTPS 필수**: 보안을 위한 HTTPS 환경 필요

### PWA 아이콘 준비

빌드 전에 다음 아이콘 파일을 `public` 폴더에 준비해야 합니다:

- `pwa-192x192.png` - 192x192px 아이콘
- `pwa-512x512.png` - 512x512px 아이콘
- `apple-touch-icon.png` - iOS용 180x180px 아이콘
- `mask-icon.svg` - Safari용 마스크 아이콘

현재는 placeholder로 작동하며, 실제 아이콘 파일을 추가하면 자동으로 사용됩니다.

## 프로젝트 구조

```
src/
├── assets/          # 정적 자산 (CSS, 이미지 등)
├── components/      # 재사용 가능한 컴포넌트
│   ├── common/      # 공통 컴포넌트 (Button, Input, Card 등)
│   └── layout/      # 레이아웃 컴포넌트 (Header, Navigation 등)
├── config/          # 설정 파일 (API, 테마 등)
├── router/          # 라우터 설정
├── services/        # API 서비스 레이어
├── stores/          # Pinia 스토어
└── views/           # 페이지 컴포넌트
    ├── auth/        # 인증 관련 페이지
    ├── instructor/  # 강사 회원 페이지
    ├── academy/     # 학원 회원 페이지
    └── error/       # 에러 페이지
```

## 설치 및 실행

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 프로덕션 빌드 및 실행

1. **프로덕션 빌드 생성**
```bash
npm run build
```

2. **프로덕션 서버 실행** (빌드된 파일로 실행)
```bash
npm run serve
# 또는
npm run preview
```

프로덕션 서버는 기본적으로 `http://localhost:4173`에서 실행되며, 동일 네트워크의 다른 기기에서 접속하려면 환경 변수에서 설정한 IP 주소로 접속하세요.

## 환경 변수

`env.example`을 복사하여 `.env` 파일을 생성한 뒤, 네트워크 환경에 맞게 값을 수정하세요.

```bash
cp env.example .env
```

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 프론트엔드에서 직접 호출할 API 베이스 URL (프록시를 사용하지 않을 때) | `http://localhost:8000/api/v1` |
| `VITE_API_TARGET` | Vite 개발 서버 프록시가 전달할 백엔드 주소 | `http://localhost:8000` |
| `VITE_DEV_HOST` | 개발 서버 호스트 (동일 네트워크 허용) | `0.0.0.0` |
| `VITE_DEV_PORT` | 개발 서버 포트 | `5173` |

동일 네트워크의 다른 기기에서 접속하려면, `VITE_API_BASE_URL`과 `VITE_API_TARGET`에 **현재 PC의 IP 주소**를 포함한 값을 설정하세요.

## 주요 기능

### 강사 회원
- 공고 목록 조회 및 필터링
- 공고 상세 조회
- 지원하기
- 지원 현황 조회
- 찜한 공고 관리
- 프로필 관리
- 인증 서류 제출

### 학원 회원
- 공고 등록 및 관리
- 지원자 목록 조회
- 지원자 상세 조회
- 채용 확정/불합격 처리
- 학원 정보 관리
- 사업자 인증 제출

## 디자인 시스템

프로젝트는 다음과 같은 디자인 시스템을 따릅니다:

- **Primary Color**: #A7C7E7 (Serene Blue)
- **Accent Color**: #FAB4B4 (Soft Coral)
- **Typography**: Pretendard 폰트
- **Mobile-first**: 모바일 우선 반응형 디자인

자세한 내용은 `D-Match Wireframe.txt` 파일을 참고하세요.

## API 명세

API 엔드포인트는 `API_Specification.md` 파일을 참고하세요.

## 라이선스

이 프로젝트는 프로젝트 팀의 소유입니다.