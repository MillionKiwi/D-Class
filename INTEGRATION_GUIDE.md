# 프론트엔드-백엔드 연동 가이드

D-Class 프로젝트의 프론트엔드와 백엔드 연동 방법입니다.

## 현재 설정 상태

### 백엔드 (Django)
- **서버 주소**: `http://localhost:8000`
- **API 기본 경로**: `/api/v1/`
- **CORS 설정**: `http://localhost:5173` 허용
- **상태**: ✅ 실행 중

### 프론트엔드 (Vue.js)
- **서버 주소**: `http://localhost:5173`
- **API 기본 경로**: `/api/v1/` (프록시 사용)
- **프록시 설정**: Vite 프록시를 통해 백엔드로 자동 전달
- **상태**: 실행 중

## 연동 방식

### 1. 프록시 방식 (현재 설정)

프론트엔드의 `vite.config.js`에 프록시가 설정되어 있어, 프론트엔드에서 `/api/v1/`로 요청하면 자동으로 백엔드(`http://localhost:8000`)로 전달됩니다.

**장점**:
- CORS 문제 없음
- 환경 변수 설정 불필요
- 개발 환경에서 간편함

**프록시 설정** (`vite.config.js`):
```javascript
server: {
  proxy: {
    '/api/v1': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

### 2. 직접 연결 방식 (선택사항)

프록시 대신 직접 백엔드에 연결하려면:

**프론트엔드 `.env` 파일 생성**:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

그리고 `vite.config.js`의 프록시 설정을 제거하거나 주석 처리합니다.

## 서버 실행 방법

### 백엔드 서버 실행

```bash
cd D-Class_back
source ../venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

### 프론트엔드 서버 실행

```bash
cd D-Class_front
npm run dev
```

## API 테스트

### 1. 브라우저에서 테스트

1. 프론트엔드 접속: `http://localhost:5173`
2. 개발자 도구(F12) 열기
3. Network 탭에서 API 요청 확인

### 2. curl로 테스트

```bash
# 프록시를 통한 요청 (프론트엔드 서버 경유)
curl http://localhost:5173/api/v1/faq/

# 직접 백엔드 요청
curl http://localhost:8000/api/v1/faq/
```

### 3. 인증이 필요한 API 테스트

```bash
# 로그인
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@dclass.com", "password": "admin123!"}'

# 응답에서 access 토큰을 받아서 사용
curl http://localhost:8000/api/v1/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 주요 API 엔드포인트

### 인증
- `POST /api/v1/auth/register/` - 회원가입
- `POST /api/v1/auth/login/` - 로그인
- `POST /api/v1/auth/token/refresh/` - 토큰 갱신
- `GET /api/v1/auth/check-email/` - 이메일 중복 확인

### 공고
- `GET /api/v1/job-postings/` - 공고 목록
- `GET /api/v1/job-postings/{id}/` - 공고 상세
- `POST /api/v1/job-postings/` - 공고 등록 (학원)

### 지원
- `POST /api/v1/applications/` - 지원하기 (강사)
- `GET /api/v1/applications/my/` - 내 지원 목록 (강사)
- `GET /api/v1/applications/` - 지원자 목록 (학원)

## 문제 해결

### CORS 오류

**증상**: 브라우저 콘솔에 CORS 관련 오류

**해결**:
1. 백엔드 `settings.py`의 `CORS_ALLOWED_ORIGINS` 확인
2. 프론트엔드 URL이 허용 목록에 있는지 확인
3. 프록시를 사용하는 경우 CORS 문제가 발생하지 않음

### 프록시 오류

**증상**: 프록시를 통한 요청이 실패

**해결**:
1. 백엔드 서버가 실행 중인지 확인
2. `vite.config.js`의 프록시 설정 확인
3. 프론트엔드 서버 재시작

### 401 Unauthorized 오류

**증상**: 인증이 필요한 API에서 401 오류

**해결**:
1. 로그인하여 토큰 받기
2. `localStorage`에 `access_token` 저장 확인
3. API 요청 헤더에 `Authorization: Bearer {token}` 포함 확인

### 404 Not Found 오류

**증상**: API 엔드포인트를 찾을 수 없음

**해결**:
1. 백엔드 URL 라우팅 확인 (`dclass_backend/urls.py`)
2. 앱별 URL 설정 확인 (`*/urls.py`)
3. API 엔드포인트 경로 확인 (`API_Specification.md`)

## 개발 팁

### 1. API 요청 로깅

프론트엔드 `api.js`에 이미 요청/응답 로깅이 설정되어 있습니다. 브라우저 콘솔에서 확인할 수 있습니다.

### 2. 토큰 자동 갱신

프론트엔드 `api.js`에 토큰 자동 갱신 로직이 구현되어 있습니다. 401 오류 시 자동으로 refresh token으로 새 access token을 받아 재시도합니다.

### 3. 개발 서버 자동 재시작

- 백엔드: 코드 변경 시 자동 재시작 (Django 기본 기능)
- 프론트엔드: 코드 변경 시 Hot Module Replacement (HMR) 자동 적용

## 프로덕션 배포 시 주의사항

1. **환경 변수 설정**: `.env` 파일에 실제 API URL 설정
2. **CORS 설정**: 프로덕션 도메인만 허용
3. **HTTPS 사용**: 프로덕션에서는 반드시 HTTPS 사용
4. **보안 설정**: `DEBUG=False`, `SECRET_KEY` 안전하게 관리

## 다음 단계

1. 프론트엔드에서 회원가입/로그인 기능 테스트
2. 공고 목록 조회 테스트
3. 지원 기능 테스트
4. 각 기능별 통합 테스트

