# D-Class 프로젝트 구조

## 📁 폴더 구조

```
D-Class_front/
├── public/                     # 정적 파일
│   └── favicon.ico
│
├── src/
│   ├── api/                    # API 통신 모듈
│   │   ├── axios.js           # Axios 인스턴스 및 인터셉터
│   │   └── index.js           # API 모듈 통합
│   │
│   ├── assets/                 # 정적 자산
│   │   ├── fonts/             # 폰트 파일 (로컬 폰트 사용 시)
│   │   └── styles/            # 스타일 파일
│   │       ├── fonts.scss     # 폰트 설정
│   │       ├── variables.scss # 디자인 시스템 변수
│   │       ├── animations.scss # 애니메이션 정의
│   │       └── global.scss    # 전역 스타일
│   │
│   ├── components/            # Vue 컴포넌트
│   │   ├── common/           # 공통 컴포넌트 (Button, Input, Card 등)
│   │   └── layout/           # 레이아웃 컴포넌트 (Header, Nav 등)
│   │
│   ├── composables/          # Vue Composables (재사용 로직)
│   │   ├── useToast.js      # Toast 메시지 관리
│   │   ├── useModal.js      # Modal 관리
│   │   ├── useLoading.js    # Loading 상태 관리
│   │   ├── useInfiniteScroll.js # 무한 스크롤
│   │   └── index.js         # Composables 통합
│   │
│   ├── router/               # Vue Router
│   │   └── index.js         # 라우트 정의 및 가드
│   │
│   ├── stores/               # Pinia 상태 관리
│   │   └── counter.js       # 예시 스토어 (추후 auth, user 등으로 교체)
│   │
│   ├── utils/                # 유틸리티 함수
│   │   ├── constants.js     # 상수 정의
│   │   ├── validators.js    # 유효성 검증 함수
│   │   └── helpers.js       # 헬퍼 함수
│   │
│   ├── views/                # 페이지 컴포넌트
│   │   ├── auth/            # 인증 관련 페이지
│   │   ├── instructor/      # 강사 페이지
│   │   ├── academy/         # 학원 페이지
│   │   └── admin/           # 관리자 페이지
│   │
│   ├── App.vue              # 루트 컴포넌트
│   └── main.js              # 앱 엔트리 포인트
│
├── .env.example              # 환경 변수 예제
├── .env.development          # 개발 환경 변수 (gitignore)
├── .env.production           # 운영 환경 변수 (gitignore)
├── .gitignore
├── .prettierrc.json
├── eslint.config.js
├── index.html
├── jsconfig.json
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#A7C7E7` (Serene Blue) - 신뢰감, 안정감
- **Accent**: `#FAB4B4` (Soft Coral) - 행동 유도
- **Background**: `#F9F9F9`
- **Card Background**: `#FFFFFF`
- **Success**: `#B2D8D8` (파스텔 민트)
- **Warning**: `#FFE5A9` (파스텔 옐로우)
- **Error**: `#FFB6C1` (파스텔 핑크)
- **Info**: `#D4E5F7` (연한 블루)

### 타이포그래피
- **Font Family**: Pretendard (CDN)
- **H1**: 22px / Bold
- **H2**: 18px / SemiBold
- **H3**: 16px / SemiBold
- **Body**: 16px / Regular
- **Body Small**: 14px / Regular
- **Caption**: 12px / Regular

### 간격 시스템
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px
- 3xl: 48px

### 반응형 Breakpoints
- Mobile: ~767px
- Tablet: 768px~1023px
- Desktop: 1024px~

## 🔧 기술 스택

### Core
- **Vue 3.5+** - 프레임워크
- **Vite 7+** - 빌드 도구
- **Vue Router 4** - 라우팅
- **Pinia 3** - 상태 관리

### Styling
- **SCSS** - CSS 전처리기
- **Pretendard** - 폰트

### Utilities
- **Axios** - HTTP 클라이언트
- **dayjs** - 날짜 처리
- **Lucide Vue Next** - 아이콘
- **@vueuse/core** - Vue 유틸리티

### Development
- **ESLint** - 코드 린팅
- **Prettier** - 코드 포맷팅

## 📝 명명 규칙

### 파일명
- 컴포넌트: PascalCase (예: `UserProfile.vue`, `JobCard.vue`)
- Composables: camelCase with 'use' prefix (예: `useAuth.js`, `useForm.js`)
- Utils: camelCase (예: `validators.js`, `helpers.js`)
- Stores: camelCase (예: `authStore.js`, `jobStore.js`)

### 코드
- 변수/함수: camelCase
- 상수: UPPER_SNAKE_CASE
- 컴포넌트: PascalCase
- CSS 클래스: kebab-case

## 🚀 시작하기

### 설치
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

### 프리뷰
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

### 포맷팅
```bash
npm run format
```

## 📚 주요 기능

### 역할 기반 시스템
- **강사 (Instructor)**: 공고 조회/지원, 프로필 관리, 인증
- **학원 (Academy)**: 공고 등록/관리, 지원자 관리
- **관리자 (Admin)**: 회원/공고/인증 관리

### 인증 시스템
- 학력/경력 인증 (강사)
- 사업자 인증 (학원)

### 리뷰 시스템
- 양방향 리뷰 (강사 ↔ 학원)

### PWA 지원
- 오프라인 모드
- 모바일 앱처럼 설치 가능

## 🔗 참고 문서

- [UI 설계 명세서](../D-Class%20Wireframe.txt)
- [Vue 3 공식 문서](https://vuejs.org/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Pinia 공식 문서](https://pinia.vuejs.org/)

