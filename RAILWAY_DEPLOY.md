# Railway 배포 가이드

이 가이드는 D-Match를 Railway에 배포하는 상세한 방법을 설명합니다.

## 📋 사전 준비

1. [Railway](https://railway.app) 계정 생성 (GitHub로 로그인)
2. GitHub에 프로젝트 저장소가 있어야 함
3. Railway CLI 설치 (선택사항, 웹 대시보드로도 가능)

```bash
npm i -g @railway/cli
railway login
```

---

## 🚀 배포 방법 1: Railway 웹 대시보드 사용 (추천)

### 1단계: Backend 배포

1. **Railway 대시보드 접속**
   - https://railway.app 접속
   - "New Project" 클릭
   - "Deploy from GitHub repo" 선택

2. **저장소 선택 및 설정**
   - D-Match 저장소 선택
   - "Add Service" → "GitHub Repo" 선택
   - Root Directory: `D-Class_back` 설정

3. **PostgreSQL 데이터베이스 추가**
   - "Add Service" → "Database" → "Add PostgreSQL" 클릭
   - 자동으로 환경 변수가 생성됨

4. **Redis 추가 (선택사항)**
   - "Add Service" → "Database" → "Add Redis" 클릭

5. **환경 변수 설정**
   - Backend 서비스 → "Variables" 탭
   - 다음 환경 변수 추가:

   ```env
   # Django Settings
   SECRET_KEY=<강력한-랜덤-문자열-생성>
   DEBUG=False
   ALLOWED_HOSTS=*.railway.app,*.up.railway.app
   
   # Database (Railway가 자동 생성한 변수 사용)
   # DATABASE_URL은 Railway가 자동으로 제공
   # 또는 수동 설정:
   DB_NAME=${{Postgres.DATABASE}}
   DB_USER=${{Postgres.USER}}
   DB_PASSWORD=${{Postgres.PASSWORD}}
   DB_HOST=${{Postgres.HOSTNAME}}
   DB_PORT=${{Postgres.PORT}}
   
   # Redis (선택사항)
   REDIS_HOST=${{Redis.REDIS_HOST}}
   REDIS_PORT=${{Redis.REDIS_PORT}}
   REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
   
   # AWS S3 (파일 저장소)
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_STORAGE_BUCKET_NAME=dmatch-media
   AWS_S3_REGION_NAME=ap-northeast-2
   
   # Email Settings
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   
   # Environment
   ENVIRONMENT=production
   ```

6. **빌드 및 시작 명령어 설정**
   - "Settings" 탭 → "Deploy" 섹션
   - Build Command: (비워두거나 `pip install -r requirements.txt`)
   - Start Command: `gunicorn dclass_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 3`

7. **배포 확인**
   - "Deployments" 탭에서 배포 상태 확인
   - 배포 완료 후 "Settings" → "Generate Domain" 클릭하여 도메인 생성
   - 예: `dmatch-backend-production.up.railway.app`

### 2단계: Frontend 배포

1. **새 서비스 추가**
   - 같은 프로젝트에서 "Add Service" → "GitHub Repo" 선택
   - Root Directory: `D-Class_front` 설정

2. **환경 변수 설정**
   - "Variables" 탭에서 다음 변수 추가:

   ```env
   # Backend API URL (1단계에서 생성한 도메인 사용)
   VITE_API_BASE_URL=https://dmatch-backend-production.up.railway.app/api/v1
   VITE_API_TARGET=https://dmatch-backend-production.up.railway.app
   ```

3. **빌드 및 시작 명령어 설정**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run serve -- --host 0.0.0.0 --port $PORT`
   - 또는 Nginx 사용: (아래 Dockerfile 사용)

4. **도메인 생성**
   - "Settings" → "Generate Domain" 클릭
   - 예: `dmatch-frontend-production.up.railway.app`

### 3단계: 데이터베이스 마이그레이션

1. **Railway CLI 사용 (권장)**
   ```bash
   railway link  # 프로젝트 연결
   railway run python manage.py migrate
   railway run python manage.py createsuperuser
   ```

2. **또는 Railway 대시보드에서**
   - Backend 서비스 → "Deployments" → 최신 배포 → "View Logs"
   - 또는 "Settings" → "Shell" 사용

### 4단계: CORS 설정 업데이트

Backend 환경 변수에 프론트엔드 도메인 추가:

```env
CORS_ALLOWED_ORIGINS=https://dmatch-frontend-production.up.railway.app
ALLOWED_HOSTS=*.railway.app,*.up.railway.app,dmatch-backend-production.up.railway.app
```

---

## 🐳 배포 방법 2: Railway 설정 파일 사용

Railway는 `railway.json` 또는 `railway.toml` 파일을 통해 설정을 자동화할 수 있습니다.

### Backend 설정 파일

**`D-Class_back/railway.json`** 생성:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt && pip install gunicorn"
  },
  "deploy": {
    "startCommand": "gunicorn dclass_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 3",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Frontend 설정 파일

**`D-Class_front/railway.json`** 생성:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run serve -- --host 0.0.0.2 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🔧 Railway CLI 사용법

### 프로젝트 연결
```bash
cd D-Class_back
railway link
```

### 환경 변수 설정
```bash
# 개별 설정
railway variables set SECRET_KEY=your-secret-key

# 파일에서 일괄 설정
railway variables < .env
```

### 로컬에서 Railway 환경 변수 사용
```bash
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

### 로그 확인
```bash
railway logs
railway logs --tail
```

---

## 📝 환경 변수 체크리스트

### Backend 필수 환경 변수

- [ ] `SECRET_KEY` (강력한 랜덤 문자열)
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` (Railway 도메인 포함)
- [ ] `DATABASE_URL` (Railway가 자동 생성) 또는 개별 DB 변수
- [ ] `CORS_ALLOWED_ORIGINS` (프론트엔드 도메인)

### Backend 선택 환경 변수

- [ ] `AWS_ACCESS_KEY_ID` (S3 사용 시)
- [ ] `AWS_SECRET_ACCESS_KEY` (S3 사용 시)
- [ ] `AWS_STORAGE_BUCKET_NAME` (S3 사용 시)
- [ ] `EMAIL_HOST`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` (이메일 발송 시)
- [ ] `REDIS_HOST`, `REDIS_PORT` (Redis 사용 시)

### Frontend 필수 환경 변수

- [ ] `VITE_API_BASE_URL` (Backend API URL)
- [ ] `VITE_API_TARGET` (Backend API URL)

---

## 🔐 SECRET_KEY 생성 방법

```bash
# Python으로 생성
python -c "import secrets; print(secrets.token_urlsafe(50))"

# 또는 OpenSSL 사용
openssl rand -base64 50
```

---

## 🌐 커스텀 도메인 설정

1. **Railway 대시보드에서**
   - 서비스 → "Settings" → "Networking"
   - "Custom Domain" 섹션에서 도메인 추가

2. **DNS 설정**
   - 도메인 제공업체에서 CNAME 레코드 추가:
     ```
     Type: CNAME
     Name: @ (또는 www)
     Value: your-service.up.railway.app
     ```

3. **SSL 인증서**
   - Railway가 자동으로 Let's Encrypt 인증서 발급

---

## 🐛 트러블슈팅

### 문제: 빌드 실패

**원인**: 의존성 설치 실패
**해결**:
- Build Command에 `pip install -r requirements.txt` 명시
- `requirements.txt`에 모든 의존성 포함 확인

### 문제: 데이터베이스 연결 실패

**원인**: 환경 변수 미설정
**해결**:
- Railway가 생성한 PostgreSQL 서비스의 환경 변수 확인
- `DATABASE_URL` 또는 개별 DB 변수 설정 확인

### 문제: CORS 오류

**원인**: 프론트엔드 도메인이 허용되지 않음
**해결**:
- Backend 환경 변수에 `CORS_ALLOWED_ORIGINS` 추가
- `ALLOWED_HOSTS`에 프론트엔드 도메인 포함

### 문제: 정적 파일이 로드되지 않음

**원인**: `collectstatic` 미실행
**해결**:
- Build Command에 `python manage.py collectstatic --noinput` 추가
- 또는 Start Command 전에 실행

### 문제: 포트 바인딩 오류

**원인**: 하드코딩된 포트 사용
**해결**:
- `$PORT` 환경 변수 사용: `--bind 0.0.0.0:$PORT`
- Railway는 동적으로 포트 할당

---

## 📊 모니터링

### Railway 대시보드에서 확인 가능한 정보

- **Metrics**: CPU, Memory, Network 사용량
- **Logs**: 실시간 로그 스트림
- **Deployments**: 배포 히스토리
- **Settings**: 환경 변수, 도메인, 빌드 설정

### 로그 확인

```bash
# Railway CLI
railway logs --tail

# 특정 서비스만
railway logs --service backend --tail
```

---

## 💰 비용 관리

### Railway 요금제

- **Hobby**: $5 크레딧/월 (무료)
- **Pro**: $20/월 (무제한 크레딧)

### 비용 최적화 팁

1. **사용하지 않는 서비스 삭제**
2. **로컬 개발 환경 활용**
3. **Sleep 모드 활용** (Hobby 플랜)
4. **리소스 사용량 모니터링**

---

## 🔄 CI/CD 자동 배포

Railway는 GitHub와 연동되어 자동 배포됩니다.

### 자동 배포 설정

1. **GitHub 저장소 연결**
   - Railway 대시보드에서 저장소 선택
   - "Auto Deploy" 활성화

2. **브랜치별 배포**
   - Production: `main` 브랜치
   - Staging: `develop` 브랜치 (선택사항)

3. **배포 트리거**
   - Push to main → 자동 배포
   - Pull Request → Preview 배포 (Pro 플랜)

---

## 📚 추가 자료

- [Railway 공식 문서](https://docs.railway.app)
- [Railway Discord 커뮤니티](https://discord.gg/railway)
- [Django on Railway 가이드](https://docs.railway.app/guides/django)

---

## ✅ 배포 체크리스트

### 배포 전
- [ ] GitHub에 코드 푸시
- [ ] 환경 변수 준비
- [ ] SECRET_KEY 생성
- [ ] AWS S3 설정 (파일 저장소 사용 시)
- [ ] 이메일 설정 (이메일 발송 필요 시)

### 배포 중
- [ ] Backend 서비스 생성
- [ ] PostgreSQL 데이터베이스 추가
- [ ] 환경 변수 설정
- [ ] 빌드 및 배포 확인
- [ ] Frontend 서비스 생성
- [ ] Frontend 환경 변수 설정
- [ ] 도메인 생성

### 배포 후
- [ ] 데이터베이스 마이그레이션 실행
- [ ] 슈퍼유저 생성
- [ ] API 엔드포인트 테스트
- [ ] 프론트엔드-백엔드 연결 확인
- [ ] CORS 설정 확인
- [ ] 커스텀 도메인 설정 (선택사항)
- [ ] 모니터링 설정

---

## 🎉 완료!

배포가 완료되면 다음 URL로 접속할 수 있습니다:

- **Frontend**: `https://your-frontend-service.up.railway.app`
- **Backend API**: `https://your-backend-service.up.railway.app/api/v1`
- **Admin**: `https://your-backend-service.up.railway.app/admin`

문제가 발생하면 Railway 대시보드의 로그를 확인하거나, 위의 트러블슈팅 섹션을 참고하세요.

