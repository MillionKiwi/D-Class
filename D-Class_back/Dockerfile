FROM python:3.11-slim

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# 애플리케이션 코드 복사
COPY . .

# 정적 파일 수집 (환경 변수가 필요하므로 런타임에 실행)
# RUN python manage.py collectstatic --noinput

EXPOSE 8000

# 마이그레이션 및 서버 실행 스크립트
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn dclass_backend.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120"]

