# D-Match 배포 가이드

이 문서는 D-Match 서비스를 프로덕션 환경에 배포하는 방법을 설명합니다.

## 목차

1. [배포 전략 개요](#배포-전략-개요)
2. [배포 옵션 비교](#배포-옵션-비교)
3. [권장 배포 방법](#권장-배포-방법)
4. [상세 배포 절차](#상세-배포-절차)
5. [환경 변수 설정](#환경-변수-설정)
6. [보안 체크리스트](#보안-체크리스트)
7. [모니터링 및 로깅](#모니터링-및-로깅)

---

## 배포 전략 개요

### 아키텍처 구성

```
┌─────────────┐
│   Frontend  │  (Vue.js + Vite)
│   (Nginx)   │
└──────┬──────┘
       │
       │ HTTPS
       │
┌──────▼──────┐
│   Backend   │  (Django REST Framework)
│   (Gunicorn)│
└──────┬──────┘
       │
       ├──► PostgreSQL (Database)
       ├──► Redis (Cache/Celery)
       └──► AWS S3 (File Storage)
```

### 주요 구성 요소

- **Frontend**: Vue.js 정적 파일 (Nginx로 서빙)
- **Backend**: Django REST API (Gunicorn + Nginx)
- **Database**: PostgreSQL
- **Cache/Queue**: Redis
- **File Storage**: AWS S3
- **Task Queue**: Celery (비동기 작업)

---

## 배포 옵션 비교

### 1. 클라우드 플랫폼 (AWS, GCP, Azure)

**장점:**
- 높은 확장성과 안정성
- 다양한 관리형 서비스 (RDS, S3, ElastiCache 등)
- 글로벌 CDN 지원
- 자동 백업 및 복구

**단점:**
- 비용이 높을 수 있음
- 설정이 복잡함
- 학습 곡선이 있음

**추천 시나리오:** 대규모 서비스, 높은 트래픽 예상

### 2. PaaS (Platform as a Service)

**옵션:**
- **Railway** (추천): 간단한 설정, 자동 배포
- **Render**: 무료 티어 제공, 쉬운 설정
- **Heroku**: 검증된 플랫폼, 플러그인 풍부
- **Fly.io**: 글로벌 배포, 빠른 성능

**장점:**
- 빠른 배포
- 자동 스케일링
- 간단한 설정
- 무료/저렴한 시작 티어

**단점:**
- 벤더 종속성
- 커스터마이징 제한
- 비용이 증가할 수 있음

**추천 시나리오:** MVP, 소규모 서비스, 빠른 출시

### 3. VPS (Virtual Private Server)

**옵션:**
- **DigitalOcean**: $6/월부터 시작
- **Linode**: 안정적인 성능
- **Vultr**: 글로벌 리전
- **AWS Lightsail**: AWS의 간단한 VPS

**장점:**
- 완전한 제어권
- 예측 가능한 비용
- 커스터마이징 자유도 높음

**단점:**
- 직접 관리 필요
- 보안 설정 필요
- 스케일링 수동 처리

**추천 시나리오:** 중소규모 서비스, 예산 제약, 커스터마이징 필요

---

## 권장 배포 방법

### 🚀 옵션 1: Railway (가장 간단, 추천)

Railway는 최소한의 설정으로 배포할 수 있는 현대적인 PaaS입니다.

#### 장점
- GitHub 연동으로 자동 배포
- PostgreSQL, Redis 자동 프로비저닝
- 환경 변수 관리 간편
- 무료 티어 제공 ($5 크레딧/월)

#### 배포 절차

1. **Railway 계정 생성 및 프로젝트 생성**
   ```bash
   # Railway CLI 설치
   npm i -g @railway/cli
   
   # 로그인
   railway login
   
   # 프로젝트 초기화
   railway init
   ```

2. **Backend 배포**
   ```bash
   cd D-Class_back
   railway up
   ```

3. **Frontend 배포**
   ```bash
   cd D-Class_front
   # 빌드 후 배포
   npm run build
   railway up
   ```

4. **환경 변수 설정** (Railway 대시보드에서)
   - Backend: `SECRET_KEY`, `DEBUG=False`, `DATABASE_URL`, `ALLOWED_HOSTS` 등
   - Frontend: `VITE_API_BASE_URL`

---

### 🐳 옵션 2: Docker + VPS (완전한 제어)

Docker를 사용하여 VPS에 배포하는 방법입니다.

#### 필요한 파일

**`docker-compose.yml`** (프로젝트 루트에 생성)
```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./D-Class_back
      dockerfile: Dockerfile
    command: gunicorn dclass_backend.wsgi:application --bind 0.0.0.0:8000 --workers 3
    volumes:
      - ./D-Class_back:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    env_file:
      - ./D-Class_back/.env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./D-Class_front
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - static_volume:/static
      - media_volume:/media
      - ./D-Class_front/dist:/usr/share/nginx/html
    ports:
      - "443:443"
      - "80:80"
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

**`D-Class_back/Dockerfile`**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# 애플리케이션 코드 복사
COPY . .

# 정적 파일 수집
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "dclass_backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
```

**`D-Class_front/Dockerfile`**
```dockerfile
# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**`nginx.conf`** (프로젝트 루트)
```nginx
upstream backend {
    server backend:8000;
}

server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /static/;
    }

    # Media files
    location /media/ {
        alias /media/;
    }
}
```

#### 배포 절차

1. **VPS 준비** (Ubuntu 22.04 권장)
   ```bash
   # Docker 설치
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Docker Compose 설치
   sudo apt-get install docker-compose-plugin
   ```

2. **프로젝트 클론 및 배포**
   ```bash
   git clone <your-repo>
   cd D-Class
   
   # 환경 변수 설정
   cp D-Class_back/.env.example D-Class_back/.env
   # .env 파일 수정
   
   # 배포
   docker compose up -d
   
   # 마이그레이션 실행
   docker compose exec backend python manage.py migrate
   docker compose exec backend python manage.py createsuperuser
   ```

3. **SSL 인증서 설정** (Let's Encrypt)
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

### ☁️ 옵션 3: AWS (프로덕션 권장)

AWS를 사용한 엔터프라이즈급 배포입니다.

#### 아키텍처

- **Frontend**: S3 + CloudFront
- **Backend**: EC2 (또는 ECS/Fargate)
- **Database**: RDS PostgreSQL
- **Cache**: ElastiCache Redis
- **File Storage**: S3
- **Load Balancer**: Application Load Balancer

#### 배포 절차

1. **RDS PostgreSQL 생성**
2. **ElastiCache Redis 생성**
3. **S3 버킷 생성** (정적 파일 및 미디어)
4. **EC2 인스턴스 생성 및 설정**
5. **CloudFront 배포** (CDN)
6. **Route 53 DNS 설정**

---

## 상세 배포 절차

### 1. 프로덕션 환경 변수 설정

#### Backend (`.env`)
```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
DB_NAME=dmatch_prod
DB_USER=dmatch_user
DB_PASSWORD=strong-password-here
DB_HOST=localhost
DB_PORT=5432

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=dmatch-media
AWS_S3_REGION_NAME=ap-northeast-2

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# JWT
JWT_SECRET_KEY=your-jwt-secret
```

#### Frontend (`.env.production`)
```env
VITE_API_BASE_URL=https://api.your-domain.com/api/v1
VITE_API_TARGET=https://api.your-domain.com
```

### 2. Backend 배포 준비

#### `dclass_backend/settings.py` 프로덕션 설정 추가

```python
# 프로덕션 환경 감지
import os
PRODUCTION = os.environ.get('ENVIRONMENT') == 'production'

if PRODUCTION:
    # 보안 설정
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    
    # 정적 파일 (S3 사용 시)
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'
    
    # 로깅
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'file': {
                'level': 'INFO',
                'class': 'logging.FileHandler',
                'filename': '/var/log/django/dmatch.log',
            },
        },
        'loggers': {
            'django': {
                'handlers': ['file'],
                'level': 'INFO',
                'propagate': True,
            },
        },
    }
```

### 3. Frontend 빌드 및 배포

```bash
cd D-Class_front

# 프로덕션 빌드
npm run build

# 빌드된 파일은 dist/ 폴더에 생성됨
# 이 파일들을 웹 서버(Nginx, S3 등)에 업로드
```

### 4. 데이터베이스 마이그레이션

```bash
# 프로덕션 서버에서
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

---

## 환경 변수 설정

### 필수 환경 변수 체크리스트

#### Backend
- [ ] `SECRET_KEY` (강력한 랜덤 문자열)
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` (도메인 목록)
- [ ] `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`
- [ ] `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_STORAGE_BUCKET_NAME`
- [ ] `EMAIL_HOST`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`

#### Frontend
- [ ] `VITE_API_BASE_URL` (프로덕션 API URL)
- [ ] `VITE_API_TARGET` (프로덕션 API URL)

---

## 보안 체크리스트

### 필수 보안 설정

- [ ] `DEBUG=False` 설정
- [ ] `SECRET_KEY` 안전하게 관리 (환경 변수 사용)
- [ ] HTTPS 강제 (`SECURE_SSL_REDIRECT=True`)
- [ ] CORS 설정 확인 (프로덕션 도메인만 허용)
- [ ] 데이터베이스 비밀번호 강력하게 설정
- [ ] AWS S3 버킷 정책 설정 (비공개)
- [ ] 정기적인 보안 업데이트
- [ ] 방화벽 설정 (필요한 포트만 열기)
- [ ] SQL 인젝션 방지 (Django ORM 사용)
- [ ] XSS 방지 (템플릿 이스케이핑)
- [ ] CSRF 보호 활성화

### Django 보안 미들웨어 확인

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    # ... 기타 미들웨어
]
```

---

## 모니터링 및 로깅

### 추천 도구

1. **Sentry** (에러 추적)
   ```bash
   pip install sentry-sdk
   ```

2. **Prometheus + Grafana** (메트릭 모니터링)

3. **Logtail / Papertrail** (로그 집계)

### Django 로깅 설정

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/dmatch.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

---

## 배포 후 확인 사항

### 기능 테스트

- [ ] 회원가입/로그인
- [ ] 프로필 수정
- [ ] 공고 등록/조회
- [ ] 지원하기
- [ ] 리뷰 작성
- [ ] 파일 업로드
- [ ] 알림 기능

### 성능 테스트

- [ ] 페이지 로딩 속도
- [ ] API 응답 시간
- [ ] 데이터베이스 쿼리 최적화
- [ ] 이미지 최적화

### 보안 테스트

- [ ] HTTPS 연결 확인
- [ ] CORS 설정 확인
- [ ] 인증/인가 테스트
- [ ] SQL 인젝션 테스트

---

## 트러블슈팅

### 일반적인 문제

1. **정적 파일이 로드되지 않음**
   ```bash
   python manage.py collectstatic --noinput
   ```

2. **데이터베이스 연결 오류**
   - 환경 변수 확인
   - 방화벽 설정 확인
   - 데이터베이스 서버 상태 확인

3. **CORS 오류**
   - `CORS_ALLOWED_ORIGINS` 설정 확인
   - 프론트엔드 도메인 추가

4. **이미지 업로드 실패**
   - S3 버킷 권한 확인
   - AWS 자격 증명 확인

---

## 비용 예상

### 소규모 서비스 (월 예상)

- **Railway**: $20-50
- **VPS (DigitalOcean)**: $12-24
- **AWS (최소 구성)**: $30-80

### 중규모 서비스 (월 예상)

- **AWS**: $200-500
- **GCP**: $150-400

---

## 다음 단계

1. **CI/CD 파이프라인 구축** (GitHub Actions, GitLab CI)
2. **자동 백업 설정**
3. **모니터링 대시보드 구축**
4. **성능 최적화**
5. **CDN 설정** (CloudFront, Cloudflare)

---

## 참고 자료

- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [Railway Documentation](https://docs.railway.app/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

