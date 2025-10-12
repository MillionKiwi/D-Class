# D-Class 환경변수 설정 가이드

## 📋 개요

D-Class 프로젝트는 Vite를 사용하므로, 모든 환경변수는 `VITE_` 접두사를 사용해야 합니다.

## 🚀 빠른 시작

### 1. 환경변수 파일 생성

프로젝트 루트에 이미 다음 파일들이 생성되어 있습니다:

```
.env.example        # 예제 파일 (Git에 커밋됨)
.env.development    # 개발 환경 (Git에서 무시됨)
.env.production     # 프로덕션 환경 (Git에서 무시됨)
```

### 2. 환경별 실행

```bash
# 개발 환경 (자동으로 .env.development 사용)
npm run dev

# 프로덕션 빌드 (.env.production 사용)
npm run build:prod
```

## 📝 환경변수 목록

### API 설정

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `VITE_API_BASE_URL` | 백엔드 API 서버 주소 | `http://localhost:8080/api` | ✅ |
| `VITE_API_TIMEOUT` | API 요청 타임아웃 (밀리초) | `10000` | ❌ |

### 앱 정보

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `VITE_APP_ENV` | 환경 구분 | `development` | ✅ |
| `VITE_APP_NAME` | 앱 이름 | `D-Class` | ✅ |
| `VITE_APP_VERSION` | 앱 버전 | `1.0.0` | ✅ |

### 파일 업로드 설정

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `VITE_MAX_FILE_SIZE` | 최대 파일 크기 (바이트) | `10485760` (10MB) | ❌ |
| `VITE_ALLOWED_FILE_TYPES` | 허용 파일 타입 (쉼표 구분) | `image/jpeg,image/png,application/pdf` | ❌ |
| `VITE_MAX_IMAGE_WIDTH` | 이미지 최대 너비 | `1024` | ❌ |
| `VITE_MAX_IMAGE_HEIGHT` | 이미지 최대 높이 | `1024` | ❌ |

### 기능 설정

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `VITE_ITEMS_PER_PAGE` | 무한 스크롤 페이지당 아이템 수 | `20` | ❌ |
| `VITE_PAGINATION_SIZE` | 페이지네이션 페이지당 아이템 수 | `30` | ❌ |
| `VITE_SEARCH_DEBOUNCE` | 검색 디바운스 시간 (밀리초) | `500` | ❌ |
| `VITE_CACHE_DURATION` | API 캐시 시간 (밀리초) | `300000` (5분) | ❌ |
| `VITE_TOAST_DURATION` | 토스트 표시 시간 (밀리초) | `3000` | ❌ |

### 인증 설정

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `VITE_AUTH_TOKEN_KEY` | JWT 토큰 저장 키 | `d-class-auth-token` | ❌ |
| `VITE_REFRESH_TOKEN_KEY` | 리프레시 토큰 저장 키 | `d-class-refresh-token` | ❌ |
| `VITE_TOKEN_REFRESH_BEFORE` | 토큰 갱신 시간 (분) | `5` | ❌ |

### 디버그 설정

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `VITE_DEBUG_MODE` | 디버그 모드 활성화 | `true` (dev), `false` (prod) | ❌ |
| `VITE_LOG_API` | API 요청/응답 로깅 | `true` (dev), `false` (prod) | ❌ |
| `VITE_LOG_LEVEL` | 콘솔 로그 레벨 | `debug` (dev), `error` (prod) | ❌ |

### 외부 서비스 (선택사항)

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API 키 | - | ❌ |
| `VITE_FIREBASE_API_KEY` | Firebase API 키 | - | ❌ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | - | ❌ |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | - | ❌ |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | - | ❌ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | - | ❌ |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | - | ❌ |

### PWA 설정

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `VITE_ENABLE_PWA` | PWA 기능 활성화 | `true` | ❌ |
| `VITE_ENABLE_OFFLINE` | 오프라인 모드 활성화 | `true` | ❌ |

## 💻 코드에서 사용하기

### 방법 1: env 유틸리티 사용 (권장)

```javascript
import env from '@/utils/env'

// API 설정 사용
console.log(env.api.baseUrl)  // http://localhost:8080/api
console.log(env.api.timeout)  // 10000

// 파일 업로드 설정 사용
const maxSize = env.upload.maxFileSize  // 10485760
const allowedTypes = env.upload.allowedFileTypes  // ['image/jpeg', 'image/png', ...]

// 기능 설정 사용
const itemsPerPage = env.features.itemsPerPage  // 20

// 환경 확인
if (env.app.isDevelopment) {
  console.log('개발 환경입니다')
}
```

### 방법 2: 헬퍼 함수 사용

```javascript
import { isDevelopment, isProduction, isDebugMode } from '@/utils/env'

if (isDevelopment()) {
  console.log('개발 모드')
}

if (isDebugMode()) {
  console.log('디버그 정보 출력')
}
```

### 방법 3: 직접 접근 (권장하지 않음)

```javascript
// 타입 안전성이 없으므로 권장하지 않습니다
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

## 🔧 환경변수 추가하기

### 1. 환경변수 파일에 추가

```bash
# .env.development 또는 .env.production에 추가
VITE_NEW_CONFIG=value
```

### 2. env.js 유틸리티 업데이트

```javascript
// src/utils/env.js
export const env = {
  // ... 기존 코드
  
  // 새로운 설정 추가
  newFeature: {
    config: getEnv('VITE_NEW_CONFIG', 'default_value'),
  },
}
```

### 3. TypeScript 타입 정의 (선택사항)

TypeScript를 사용하는 경우 `env.d.ts` 파일에 타입을 추가하세요:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEW_CONFIG: string
  // ... 기타 환경변수
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## ⚠️ 주의사항

1. **보안**: `.env.development`와 `.env.production` 파일은 절대 Git에 커밋하지 마세요!
2. **접두사**: Vite에서 사용하려면 반드시 `VITE_` 접두사를 붙여야 합니다.
3. **클라이언트 노출**: 모든 `VITE_` 환경변수는 클라이언트에 노출되므로, 민감한 정보(API 키, 비밀번호 등)는 백엔드에서 관리하세요.
4. **빌드 시점**: 환경변수는 빌드 시점에 정적으로 대체되므로, 런타임에 변경할 수 없습니다.

## 🐛 트러블슈팅

### 환경변수가 적용되지 않을 때

1. **개발 서버 재시작**: 환경변수 변경 후 개발 서버를 재시작하세요.
   ```bash
   npm run dev
   ```

2. **접두사 확인**: `VITE_` 접두사가 있는지 확인하세요.

3. **파일 위치 확인**: 환경변수 파일이 프로젝트 루트에 있는지 확인하세요.

4. **캐시 삭제**: 빌드 캐시를 삭제하고 다시 빌드하세요.
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### undefined 에러가 발생할 때

```javascript
// ❌ 잘못된 방법
const value = import.meta.env.VITE_MY_VAR

// ✅ 올바른 방법 (기본값 제공)
import { env } from '@/utils/env'
const value = env.myFeature?.config || 'default'
```

## 📚 참고 자료

- [Vite 환경변수 공식 문서](https://vitejs.dev/guide/env-and-mode.html)
- [Vue 3 공식 문서](https://vuejs.org/)
- [D-Class 프로젝트 구조](./PROJECT_STRUCTURE.md)

## 🆘 도움이 필요하신가요?

문제가 발생하면 다음을 확인하세요:
1. 이 가이드의 "트러블슈팅" 섹션
2. `.env.example` 파일의 예제
3. `src/utils/env.js` 파일의 구현

그래도 해결되지 않으면 팀에 문의하세요! 🙏

