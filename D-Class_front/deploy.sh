#!/bin/bash

# D-Class Frontend 배포 스크립트

echo "🚀 D-Class 프론트엔드 배포 시작"

# 환경 변수 확인
if [ -z "$1" ]; then
  echo "❌ 환경을 지정해주세요: ./deploy.sh [development|production]"
  exit 1
fi

ENV=$1
echo "📦 환경: $ENV"

# 환경 파일 확인
if [ ! -f ".env.$ENV" ]; then
  echo "❌ .env.$ENV 파일이 존재하지 않습니다"
  exit 1
fi

# 의존성 설치
echo "📥 의존성 설치 중..."
npm ci

# 린트 검사
echo "🔍 코드 검사 중..."
npm run lint

# 빌드
echo "🏗️  빌드 중..."
if [ "$ENV" = "production" ]; then
  npm run build -- --mode production
else
  npm run build -- --mode $ENV
fi

# 빌드 성공 확인
if [ $? -ne 0 ]; then
  echo "❌ 빌드 실패"
  exit 1
fi

echo "✅ 빌드 완료"

# 배포 (예시 - 실제 배포 방식에 맞게 수정)
if [ "$ENV" = "production" ]; then
  echo "🚢 프로덕션 서버에 배포 중..."
  # AWS S3, Netlify, Vercel 등으로 배포
  # 예: aws s3 sync dist/ s3://your-bucket-name --delete
  # 예: netlify deploy --prod --dir=dist
  # 예: vercel --prod
else
  echo "🚢 개발 서버에 배포 중..."
  # 개발 서버 배포 명령
fi

echo "✅ 배포 완료!"

