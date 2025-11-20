# 빠른 배포 가이드

이 가이드는 D-Match를 가장 빠르게 배포하는 방법을 설명합니다.

## 🚀 옵션 1: Railway로 5분 안에 배포하기 (가장 간단)

### 1단계: Railway 계정 생성
1. [Railway.app](https://railway.app) 접속
2. GitHub로 로그인
3. "New Project" 클릭

### 2단계: Backend 배포
1. "Deploy from GitHub repo" 선택
2. D-Match 저장소 선택
3. Root Directory를 `D-Class_back`로 설정
4. 환경 변수 추가:
   ```
   SECRET_KEY=<랜덤-문자열>
   DEBUG=False
   ALLOWED_HOSTS=<railway-도메인>
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=<railway-자동생성>
   DB_HOST=<railway-자동생성>
   DB_PORT=5432
   ```
5. PostgreSQL 플러그인 추가 (Railway 대시보드에서)
6. Redis 플러그인 추가 (선택사항)

### 3단계: Frontend 배포
1. 새 서비스 추가
2. Root Directory를 `D-Class_front`로 설정
3. Build Command: `npm run build`
4. Start Command: `npm run serve`
5. 환경 변수 추가:
   ```
   VITE_API_BASE_URL=<backend-railway-url>/api/v1
   ```

### 4단계: 도메인 설정
- Railway 대시보드에서 각 서비스에 도메인 할당
- HTTPS 자동 설정됨

---

## 🐳 옵션 2: Docker Compose로 로컬/VPS 배포

### 사전 준비
```bash
# Docker 및 Docker Compose 설치 확인
docker --version
docker compose version
```

### 1단계: 환경 변수 설정
```bash
# Backend 환경 변수
cp D-Class_back/.env.example D-Class_back/.env
# .env 파일 수정 (SECRET_KEY, DB_PASSWORD 등)

# Frontend 환경 변수 (선택사항)
cp D-Class_front/.env.production.example D-Class_front/.env.production
```

### 2단계: Docker Compose로 실행
```bash
# 프로젝트 루트에서
docker compose up -d

# 로그 확인
docker compose logs -f

# 마이그레이션 실행 (처음 한 번만)
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

### 3단계: 접속 확인
- Frontend: http://localhost
- Backend API: http://localhost:8000/api/v1
- Admin: http://localhost:8000/admin

### 4단계: 프로덕션 배포 (VPS)
```bash
# VPS에 접속 후
git clone <your-repo>
cd D-Class

# 환경 변수 설정
nano D-Class_back/.env  # 프로덕션 값으로 수정

# 배포
docker compose -f docker-compose.yml up -d

# SSL 인증서 설정 (Let's Encrypt)
sudo apt-get install certbot
sudo certbot certonly --standalone -d your-domain.com
```

---

## ☁️ 옵션 3: Render로 배포 (무료 티어)

### Backend 배포
1. [Render.com](https://render.com) 접속
2. "New +" → "Web Service"
3. GitHub 저장소 연결
4. 설정:
   - **Name**: dmatch-backend
   - **Root Directory**: D-Class_back
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command**: `gunicorn dclass_backend.wsgi:application`
5. PostgreSQL 데이터베이스 추가
6. 환경 변수 설정

### Frontend 배포
1. "New +" → "Static Site"
2. GitHub 저장소 연결
3. 설정:
   - **Root Directory**: D-Class_front
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist
4. 환경 변수 설정 (VITE_API_BASE_URL)

---

## 📋 배포 체크리스트

### 배포 전
- [ ] 환경 변수 모두 설정
- [ ] `DEBUG=False` 확인
- [ ] `SECRET_KEY` 변경
- [ ] `ALLOWED_HOSTS` 설정
- [ ] 데이터베이스 백업 (기존 데이터가 있는 경우)

### 배포 후
- [ ] 마이그레이션 실행
- [ ] 슈퍼유저 생성
- [ ] 정적 파일 수집
- [ ] HTTPS 연결 확인
- [ ] API 엔드포인트 테스트
- [ ] 프론트엔드-백엔드 연결 확인

---

## 🔧 트러블슈팅

### 문제: 데이터베이스 연결 실패
```bash
# Docker Compose 사용 시
docker compose ps  # 서비스 상태 확인
docker compose logs db  # 데이터베이스 로그 확인
```

### 문제: 정적 파일이 로드되지 않음
```bash
docker compose exec backend python manage.py collectstatic --noinput
```

### 문제: CORS 오류
- Backend `.env`에서 `ALLOWED_HOSTS`에 프론트엔드 도메인 추가
- `CORS_ALLOWED_ORIGINS` 설정 확인

---

## 💰 비용 비교

| 플랫폼 | 무료 티어 | 시작 가격 | 추천 용도 |
|--------|----------|----------|----------|
| Railway | $5 크레딧/월 | $5/월 | MVP, 소규모 |
| Render | 무료 (제한적) | $7/월 | 소규모 |
| DigitalOcean | 없음 | $6/월 | 중소규모 |
| AWS | 1년 무료 | $30/월 | 대규모 |

---

## 📚 추가 자료

- [상세 배포 가이드](./DEPLOYMENT_GUIDE.md)
- [Django 배포 체크리스트](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [Vite 프로덕션 빌드](https://vitejs.dev/guide/build.html)

