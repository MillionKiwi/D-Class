# D-Class 백엔드 프로젝트

D-Class (디클래스) 백엔드 API 서버입니다.

## 기술 스택

- **Framework**: Django 4.2 + Django REST Framework
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (djangorestframework-simplejwt)
- **File Storage**: AWS S3 (선택)
- **Task Queue**: Celery + Redis (선택)

## 프로젝트 구조

```
D-Class_back/
├── dclass_backend/          # Django 프로젝트 설정
│   ├── settings.py          # 프로젝트 설정
│   ├── urls.py              # 메인 URL 설정
│   └── ...
├── users/                   # 사용자 관리 앱
├── instructors/             # 강사 프로필 앱
├── academies/               # 학원 프로필 앱
├── job_postings/            # 공고 관리 앱
├── applications/            # 지원 관리 앱
├── reviews/                 # 리뷰 앱
├── verifications/           # 인증 서류 앱
├── favorites/               # 찜 앱
├── notifications/           # 알림 앱
├── common/                  # 공통 기능 앱
├── manage.py               # Django 관리 스크립트
├── requirements.txt         # Python 패키지 목록
└── venv/                   # 가상환경 (로컬)
```

## 설치 및 실행

### 1. 가상환경 활성화

```bash
cd D-Class_back
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate     # Windows
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 필요한 환경 변수를 설정하세요:

```bash
# .env 파일 예시
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=dclass_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. 데이터베이스 설정

PostgreSQL 데이터베이스를 생성하고 마이그레이션을 실행하세요:

```bash
# PostgreSQL 데이터베이스 생성
createdb dclass_db

# 마이그레이션 실행
python manage.py makemigrations
python manage.py migrate
```

### 4. 슈퍼유저 생성

```bash
python manage.py createsuperuser
```

### 5. 개발 서버 실행

```bash
python manage.py runserver
```

서버는 `http://localhost:8000`에서 실행됩니다.

## API 엔드포인트

API 기본 URL: `http://localhost:8000/api/v1/`

### 인증 (Authentication)

- `POST /auth/register/` - 회원가입
- `POST /auth/login/` - 로그인
- `POST /auth/token/refresh/` - 토큰 갱신
- `POST /auth/logout/` - 로그아웃
- `GET /auth/check-email/` - 이메일 중복 확인
- `POST /auth/password/reset/` - 비밀번호 찾기
- `POST /auth/password/reset/confirm/` - 비밀번호 재설정

자세한 API 명세는 상위 폴더의 `API_Specification.md` 파일을 참고하세요.

## 개발 진행 상황

### 완료된 작업

- [x] Django 프로젝트 초기 설정
- [x] 기본 앱 구조 생성
- [x] 설정 파일 구성 (DRF, JWT, CORS 등)
- [x] Custom User 모델 생성
- [x] 프로젝트 폴더 구조 정리

### 진행 중인 작업

- [ ] User 모델 마이그레이션
- [ ] 인증 API 구현
- [ ] 각 앱별 모델 정의
- [ ] 시리얼라이저 및 ViewSet 구현
- [ ] URL 라우팅 설정

### 예정된 작업

- [ ] 권한 및 인증 커스텀 클래스
- [ ] 파일 업로드 처리
- [ ] 알림 시스템
- [ ] 검색 기능
- [ ] 테스트 작성
- [ ] API 문서화

## 다음 단계

1. **모델 정의**: 각 앱의 모델을 API 명세서에 맞게 정의
2. **인증 API 구현**: 회원가입, 로그인, 토큰 갱신 등
3. **시리얼라이저 작성**: 모델을 JSON으로 변환하는 시리얼라이저 작성
4. **ViewSet 구현**: CRUD 작업을 처리하는 ViewSet 작성
5. **URL 라우팅**: 각 앱의 URL 설정
6. **권한 설정**: 각 엔드포인트별 권한 설정
7. **테스트 작성**: 단위 테스트 및 통합 테스트

## 참고 문서

- `../API_Specification.md` - API 명세서
- `../D-Class Wireframe.txt` - UI 설계 명세서
- `../stack.txt` - 기술 스택 정보

## 문제 해결

### 데이터베이스 연결 오류

PostgreSQL이 설치되어 있고 실행 중인지 확인하세요:

```bash
# PostgreSQL 상태 확인 (macOS)
brew services list

# PostgreSQL 시작
brew services start postgresql
```

### 마이그레이션 오류

기존 마이그레이션 파일을 삭제하고 다시 생성:

```bash
# 각 앱의 migrations 폴더에서 __pycache__와 0001_initial.py 등 삭제
python manage.py makemigrations
python manage.py migrate
```

### CORS 오류

`settings.py`의 `CORS_ALLOWED_ORIGINS`에 프론트엔드 URL이 포함되어 있는지 확인하세요.

