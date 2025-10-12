# D-Class API 명세서

## 📋 문서 정보
- **프로젝트**: D-Class (디클래스) Frontend
- **버전**: 1.0.0
- **작성일**: 2025년 10월
- **Base URL**: `process.env.VITE_API_BASE_URL`

---

## 🔐 인증 방식
- **방식**: Bearer Token Authentication
- **헤더**: `Authorization: Bearer {accessToken}`
- **토큰 갱신**: Refresh Token을 통한 자동 갱신

---

## 📑 목차
1. [인증 API](#1-인증-api)
2. [공고 API](#2-공고-api)
3. [지원 API](#3-지원-api)
4. [프로필 API](#4-프로필-api)
5. [인증 서류 API](#5-인증-서류-api)
6. [알림 API](#6-알림-api)
7. [리뷰 API](#7-리뷰-api)
8. [관리자 API](#8-관리자-api)

---

## 1. 인증 API

### 1.1 로그인
```
POST /auth/login
```

**요청 바디:**
```json
{
  "email": "string",
  "password": "string"
}
```

**응답 (200 OK):**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "instructor | academy | admin",
    "profileImage": "string | null",
    "isVerified": "boolean"
  },
  "accessToken": "string",
  "refreshToken": "string"
}
```

**에러 응답:**
- `400`: 잘못된 요청 형식
- `401`: 이메일 또는 비밀번호 불일치
- `500`: 서버 오류

---

### 1.2 회원가입
```
POST /auth/signup
```

**요청 바디:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "role": "instructor | academy",
  "phone": "string",
  "agreedToTerms": "boolean",
  "agreedToPrivacy": "boolean"
}
```

**응답 (201 Created):**
```json
{
  "message": "회원가입이 완료되었습니다.",
  "userId": "string"
}
```

**에러 응답:**
- `400`: 필수 입력값 누락 또는 유효하지 않은 형식
- `409`: 이미 존재하는 이메일
- `500`: 서버 오류

---

### 1.3 로그아웃
```
POST /auth/logout
```

**헤더:**
```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**
```json
{
  "message": "로그아웃되었습니다."
}
```

---

### 1.4 토큰 갱신
```
POST /auth/refresh
```

**요청 바디:**
```json
{
  "refreshToken": "string"
}
```

**응답 (200 OK):**
```json
{
  "accessToken": "string"
}
```

**에러 응답:**
- `401`: 유효하지 않은 리프레시 토큰
- `500`: 서버 오류

---

### 1.5 현재 사용자 정보 조회
```
GET /auth/me
```

**헤더:**
```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "instructor | academy | admin",
  "profileImage": "string | null",
  "isVerified": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

## 2. 공고 API

### 2.1 공고 목록 조회
```
GET /jobs
```

**쿼리 파라미터:**
```
page: number (default: 1)
limit: number (default: 20)
region: string (optional)
genres: string[] (optional, comma-separated)
workTimes: string[] (optional, comma-separated)
sortBy: "latest" | "salary" (default: "latest")
```

**응답 (200 OK):**
```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "academy": {
        "id": "string",
        "name": "string",
        "isVerified": "boolean",
        "profileImage": "string | null",
        "rating": "number"
      },
      "region": "string",
      "genres": ["string"],
      "workTimes": ["string"],
      "salary": "number",
      "salaryType": "hourly | monthly",
      "status": "open | closed",
      "createdAt": "string (ISO 8601)",
      "viewCount": "number",
      "applicationCount": "number"
    }
  ],
  "total": "number",
  "page": "number",
  "hasMore": "boolean"
}
```

---

### 2.2 공고 상세 조회
```
GET /jobs/:id
```

**응답 (200 OK):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "academy": {
    "id": "string",
    "name": "string",
    "isVerified": "boolean",
    "profileImage": "string | null",
    "rating": "number",
    "address": "string",
    "location": {
      "lat": "number",
      "lng": "number"
    }
  },
  "region": "string",
  "genres": ["string"],
  "workDays": ["string"],
  "workTimes": ["string"],
  "workHours": "string",
  "salary": "number",
  "salaryType": "hourly | monthly",
  "preferredQualifications": ["string"],
  "benefits": ["string"],
  "status": "open | closed",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "closedAt": "string | null (ISO 8601)",
  "viewCount": "number",
  "applicationCount": "number",
  "hasApplied": "boolean",
  "isFavorite": "boolean"
}
```

**에러 응답:**
- `404`: 공고를 찾을 수 없음
- `500`: 서버 오류

---

### 2.3 공고 등록 (학원)
```
POST /jobs
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: academy
```

**요청 바디:**
```json
{
  "title": "string",
  "description": "string",
  "region": "string",
  "genres": ["string"],
  "workDays": ["string"],
  "workTimes": ["string"],
  "workHours": "string",
  "salary": "number",
  "salaryType": "hourly | monthly",
  "preferredQualifications": ["string"],
  "benefits": ["string"]
}
```

**응답 (201 Created):**
```json
{
  "id": "string",
  "message": "공고가 등록되었습니다. 관리자 검토 후 게시됩니다.",
  "status": "pending"
}
```

**에러 응답:**
- `400`: 필수 입력값 누락
- `403`: 권한 없음 (학원 회원만 가능)
- `500`: 서버 오류

---

### 2.4 공고 수정 (학원)
```
PUT /jobs/:id
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: academy
```

**요청 바디:** (2.3과 동일)

**응답 (200 OK):**
```json
{
  "id": "string",
  "message": "공고가 수정되었습니다.",
  "data": { /* 수정된 공고 정보 */ }
}
```

**에러 응답:**
- `403`: 권한 없음 (본인의 공고만 수정 가능)
- `404`: 공고를 찾을 수 없음
- `500`: 서버 오류

---

### 2.5 공고 삭제 (학원)
```
DELETE /jobs/:id
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: academy
```

**응답 (200 OK):**
```json
{
  "message": "공고가 삭제되었습니다."
}
```

**에러 응답:**
- `403`: 권한 없음
- `404`: 공고를 찾을 수 없음
- `500`: 서버 오류

---

### 2.6 공고 마감 (학원)
```
PATCH /jobs/:id/close
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: academy
```

**응답 (200 OK):**
```json
{
  "message": "공고가 마감되었습니다.",
  "closedAt": "string (ISO 8601)"
}
```

---

### 2.7 찜하기 추가 (강사)
```
POST /jobs/:id/favorite
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: instructor
```

**응답 (200 OK):**
```json
{
  "message": "찜 목록에 추가되었습니다.",
  "favoriteId": "string"
}
```

**에러 응답:**
- `409`: 이미 찜한 공고
- `500`: 서버 오류

---

### 2.8 찜하기 제거 (강사)
```
DELETE /jobs/:id/favorite
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: instructor
```

**응답 (200 OK):**
```json
{
  "message": "찜 목록에서 제거되었습니다."
}
```

---

### 2.9 찜한 공고 목록 조회 (강사)
```
GET /jobs/favorites
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: instructor
```

**응답 (200 OK):**
```json
{
  "data": [
    /* 2.1의 공고 객체와 동일한 구조 */
  ],
  "total": "number"
}
```

---

## 3. 지원 API

### 3.1 공고 지원하기 (강사)
```
POST /jobs/:id/apply
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: instructor
```

**응답 (201 Created):**
```json
{
  "id": "string",
  "message": "지원이 완료되었습니다.",
  "application": {
    "id": "string",
    "jobId": "string",
    "status": "applied",
    "appliedAt": "string (ISO 8601)"
  }
}
```

**에러 응답:**
- `400`: 이미 지원한 공고
- `404`: 공고를 찾을 수 없음
- `500`: 서버 오류

---

### 3.2 내 지원 현황 조회 (강사)
```
GET /applications/me
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: instructor
```

**응답 (200 OK):**
```json
{
  "data": [
    {
      "id": "string",
      "job": {
        "id": "string",
        "title": "string",
        "academy": {
          "id": "string",
          "name": "string",
          "profileImage": "string | null"
        },
        "salary": "number",
        "salaryType": "string"
      },
      "status": "applied | reviewing | accepted | rejected",
      "appliedAt": "string (ISO 8601)",
      "updatedAt": "string (ISO 8601)"
    }
  ],
  "total": "number"
}
```

---

### 3.3 지원 상세 조회 (강사)
```
GET /applications/:id
```

**헤더:**
```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**
```json
{
  "id": "string",
  "job": { /* 2.2의 공고 상세 정보 */ },
  "instructor": { /* 강사 프로필 정보 */ },
  "status": "applied | reviewing | accepted | rejected",
  "appliedAt": "string (ISO 8601)",
  "reviewedAt": "string | null (ISO 8601)",
  "message": "string | null"
}
```

---

### 3.4 지원자 목록 조회 (학원)
```
GET /applicants
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: academy
```

**쿼리 파라미터:**
```
jobId: string (optional)
status: "applied" | "reviewing" | "accepted" | "rejected" (optional)
```

**응답 (200 OK):**
```json
{
  "data": [
    {
      "id": "string",
      "instructor": {
        "id": "string",
        "name": "string",
        "profileImage": "string | null",
        "isVerified": "boolean",
        "genres": ["string"],
        "experience": "number (years)"
      },
      "job": {
        "id": "string",
        "title": "string"
      },
      "status": "applied | reviewing | accepted | rejected",
      "appliedAt": "string (ISO 8601)"
    }
  ],
  "total": "number"
}
```

---

### 3.5 지원자 상세 조회 (학원)
```
GET /applicants/:id
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: academy
```

**응답 (200 OK):**
```json
{
  "id": "string",
  "instructor": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "profileImage": "string | null",
    "isVerified": "boolean",
    "bio": "string",
    "genres": ["string"],
    "experience": "number",
    "educations": [
      {
        "id": "string",
        "school": "string",
        "major": "string",
        "degree": "string",
        "startDate": "string",
        "endDate": "string | null"
      }
    ],
    "careers": [
      {
        "id": "string",
        "organization": "string",
        "position": "string",
        "description": "string",
        "startDate": "string",
        "endDate": "string | null"
      }
    ]
  },
  "job": { /* 공고 정보 */ },
  "status": "applied | reviewing | accepted | rejected",
  "appliedAt": "string (ISO 8601)"
}
```

---

### 3.6 채용 확정 (학원)
```
PATCH /applicants/:id/accept
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: academy
```

**응답 (200 OK):**
```json
{
  "message": "채용이 확정되었습니다.",
  "status": "accepted",
  "acceptedAt": "string (ISO 8601)"
}
```

---

### 3.7 불합격 처리 (학원)
```
PATCH /applicants/:id/reject
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: academy
```

**요청 바디 (선택):**
```json
{
  "message": "string"
}
```

**응답 (200 OK):**
```json
{
  "message": "불합격 처리되었습니다.",
  "status": "rejected",
  "rejectedAt": "string (ISO 8601)"
}
```

---

### 3.8 채용 확정 목록 조회 (학원)
```
GET /applicants/hired
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: academy
```

**응답 (200 OK):**
```json
{
  "data": [
    {
      "id": "string",
      "instructor": { /* 강사 기본 정보 */ },
      "job": { /* 공고 정보 */ },
      "acceptedAt": "string (ISO 8601)",
      "startDate": "string | null"
    }
  ],
  "total": "number"
}
```

---

## 4. 프로필 API

### 4.1 프로필 조회
```
GET /profile
```

**헤더:**
```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**

**강사 프로필:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "profileImage": "string | null",
  "bio": "string",
  "isVerified": "boolean",
  "genres": ["string"],
  "experience": "number",
  "educations": [
    {
      "id": "string",
      "school": "string",
      "major": "string",
      "degree": "string",
      "startDate": "string",
      "endDate": "string | null",
      "isCurrent": "boolean"
    }
  ],
  "careers": [
    {
      "id": "string",
      "organization": "string",
      "position": "string",
      "description": "string",
      "startDate": "string",
      "endDate": "string | null",
      "isCurrent": "boolean"
    }
  ]
}
```

**학원 프로필:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "profileImage": "string | null",
  "isVerified": "boolean",
  "businessNumber": "string",
  "address": "string",
  "detailAddress": "string",
  "location": {
    "lat": "number",
    "lng": "number"
  },
  "description": "string",
  "genres": ["string"],
  "facilities": ["string"],
  "rating": "number",
  "reviewCount": "number"
}
```

---

### 4.2 프로필 업데이트
```
PUT /profile
```

**헤더:**
```
Authorization: Bearer {accessToken}
```

**요청 바디:** (4.1의 해당 역할에 맞는 구조)

**응답 (200 OK):**
```json
{
  "message": "프로필이 저장되었습니다.",
  "data": { /* 업데이트된 프로필 정보 */ }
}
```

---

### 4.3 프로필 이미지 업로드
```
POST /profile/image
```

**헤더:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**요청 바디:**
```
image: File
```

**응답 (200 OK):**
```json
{
  "message": "프로필 사진이 업로드되었습니다.",
  "imageUrl": "string"
}
```

**에러 응답:**
- `400`: 유효하지 않은 파일 형식 또는 크기 초과
- `500`: 서버 오류

---

### 4.4 경력 추가 (강사)
```
POST /profile/careers
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: instructor
```

**요청 바디:**
```json
{
  "organization": "string",
  "position": "string",
  "description": "string",
  "startDate": "string (YYYY-MM)",
  "endDate": "string | null (YYYY-MM)",
  "isCurrent": "boolean"
}
```

**응답 (201 Created):**
```json
{
  "message": "경력이 추가되었습니다.",
  "data": {
    "id": "string",
    /* 입력한 데이터 */
  }
}
```

---

### 4.5 경력 삭제 (강사)
```
DELETE /profile/careers/:id
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: instructor
```

**응답 (200 OK):**
```json
{
  "message": "경력이 삭제되었습니다."
}
```

---

### 4.6 학력 추가 (강사)
```
POST /profile/educations
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: instructor
```

**요청 바디:**
```json
{
  "school": "string",
  "major": "string",
  "degree": "bachelor | master | doctor",
  "startDate": "string (YYYY-MM)",
  "endDate": "string | null (YYYY-MM)",
  "isCurrent": "boolean"
}
```

**응답 (201 Created):**
```json
{
  "message": "학력이 추가되었습니다.",
  "data": {
    "id": "string",
    /* 입력한 데이터 */
  }
}
```

---

### 4.7 학력 삭제 (강사)
```
DELETE /profile/educations/:id
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: instructor
```

**응답 (200 OK):**
```json
{
  "message": "학력이 삭제되었습니다."
}
```

---

## 5. 인증 서류 API

### 5.1 인증 서류 제출
```
POST /verification/submit
```

**헤더:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**요청 바디:**
```
documents: File[] (multiple files)
```

**응답 (201 Created):**
```json
{
  "message": "인증 신청이 완료되었습니다. 검토까지 1-2일 소요됩니다.",
  "verificationId": "string",
  "status": "pending",
  "submittedAt": "string (ISO 8601)"
}
```

**에러 응답:**
- `400`: 파일 형식 또는 크기 오류
- `409`: 이미 인증 신청 중
- `500`: 서버 오류

---

### 5.2 인증 상태 조회
```
GET /verification/status
```

**헤더:**
```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**
```json
{
  "status": "none | pending | approved | rejected",
  "submittedAt": "string | null (ISO 8601)",
  "reviewedAt": "string | null (ISO 8601)",
  "message": "string | null",
  "documents": [
    {
      "id": "string",
      "fileName": "string",
      "fileUrl": "string"
    }
  ]
}
```

---

## 6. 알림 API

### 6.1 알림 목록 조회
```
GET /notifications
```

**헤더:**
```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**
```json
{
  "notifications": [
    {
      "id": "string",
      "type": "application_result | verification_result | new_job | message",
      "title": "string",
      "message": "string",
      "relatedId": "string | null",
      "isRead": "boolean",
      "createdAt": "string (ISO 8601)"
    }
  ],
  "unreadCount": "number"
}
```

---

### 6.2 알림 읽음 처리
```
PATCH /notifications/:id/read
```

**헤더:**
```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**
```json
{
  "message": "알림을 읽음 처리했습니다."
}
```

---

### 6.3 모든 알림 읽음 처리
```
PATCH /notifications/read-all
```

**헤더:**
```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**
```json
{
  "message": "모든 알림을 읽음 처리했습니다.",
  "count": "number"
}
```

---

### 6.4 알림 삭제
```
DELETE /notifications/:id
```

**헤더:**
```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**
```json
{
  "message": "알림이 삭제되었습니다."
}
```

---

### 6.5 알림 설정 조회
```
GET /notifications/settings
```

**헤더:**
```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**
```json
{
  "applicationResult": "boolean",
  "verificationResult": "boolean",
  "newJob": "boolean",
  "events": "boolean"
}
```

---

### 6.6 알림 설정 저장
```
PUT /notifications/settings
```

**헤더:**
```
Authorization: Bearer {accessToken}
```

**요청 바디:**
```json
{
  "applicationResult": "boolean",
  "verificationResult": "boolean",
  "newJob": "boolean",
  "events": "boolean"
}
```

**응답 (200 OK):**
```json
{
  "message": "알림 설정이 저장되었습니다.",
  "data": { /* 저장된 설정 */ }
}
```

---

## 7. 리뷰 API

### 7.1 리뷰 작성 (강사 → 학원)
```
POST /reviews
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: instructor
```

**요청 바디:**
```json
{
  "academyId": "string",
  "jobId": "string",
  "rating": "number (1-5)",
  "content": "string",
  "pros": ["string"],
  "cons": ["string"]
}
```

**응답 (201 Created):**
```json
{
  "message": "리뷰가 등록되었습니다.",
  "data": {
    "id": "string",
    /* 작성한 리뷰 정보 */
  }
}
```

**에러 응답:**
- `400`: 이미 리뷰 작성함
- `403`: 채용 확정된 공고만 리뷰 작성 가능
- `500`: 서버 오류

---

### 7.2 학원 리뷰 목록 조회
```
GET /academies/:academyId/reviews
```

**쿼리 파라미터:**
```
page: number (default: 1)
limit: number (default: 10)
sortBy: "latest" | "rating" (default: "latest")
```

**응답 (200 OK):**
```json
{
  "data": [
    {
      "id": "string",
      "instructor": {
        "id": "string",
        "name": "string",
        "profileImage": "string | null"
      },
      "rating": "number",
      "content": "string",
      "pros": ["string"],
      "cons": ["string"],
      "createdAt": "string (ISO 8601)"
    }
  ],
  "summary": {
    "averageRating": "number",
    "totalCount": "number",
    "ratingDistribution": {
      "5": "number",
      "4": "number",
      "3": "number",
      "2": "number",
      "1": "number"
    }
  },
  "page": "number",
  "hasMore": "boolean"
}
```

---

### 7.3 내가 작성한 리뷰 목록 조회 (강사)
```
GET /reviews/me
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: instructor
```

**응답 (200 OK):**
```json
{
  "data": [
    {
      "id": "string",
      "academy": {
        "id": "string",
        "name": "string",
        "profileImage": "string | null"
      },
      "job": {
        "id": "string",
        "title": "string"
      },
      "rating": "number",
      "content": "string",
      "createdAt": "string (ISO 8601)"
    }
  ],
  "total": "number"
}
```

---

### 7.4 리뷰 수정 (강사)
```
PUT /reviews/:id
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: instructor
```

**요청 바디:** (7.1과 동일, academyId와 jobId 제외)

**응답 (200 OK):**
```json
{
  "message": "리뷰가 수정되었습니다.",
  "data": { /* 수정된 리뷰 */ }
}
```

---

### 7.5 리뷰 삭제 (강사)
```
DELETE /reviews/:id
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: instructor
```

**응답 (200 OK):**
```json
{
  "message": "리뷰가 삭제되었습니다."
}
```

---

## 8. 관리자 API

### 8.1 대시보드 통계
```
GET /admin/dashboard/stats
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: admin
```

**응답 (200 OK):**
```json
{
  "users": {
    "total": "number",
    "instructors": "number",
    "academies": "number",
    "newThisMonth": "number"
  },
  "jobs": {
    "total": "number",
    "active": "number",
    "pending": "number",
    "closed": "number"
  },
  "applications": {
    "total": "number",
    "thisMonth": "number",
    "accepted": "number"
  },
  "verifications": {
    "pending": "number",
    "approvedThisMonth": "number"
  }
}
```

---

### 8.2 회원 관리 목록
```
GET /admin/users
```

**쿼리 파라미터:**
```
role: "instructor" | "academy" | "all" (default: "all")
status: "active" | "suspended" | "all" (default: "all")
page: number (default: 1)
limit: number (default: 20)
```

**응답 (200 OK):**
```json
{
  "data": [
    {
      "id": "string",
      "email": "string",
      "name": "string",
      "role": "string",
      "isVerified": "boolean",
      "status": "active | suspended",
      "createdAt": "string (ISO 8601)",
      "lastLoginAt": "string | null (ISO 8601)"
    }
  ],
  "total": "number",
  "page": "number",
  "hasMore": "boolean"
}
```

---

### 8.3 인증 심사 목록
```
GET /admin/verifications
```

**쿼리 파라미터:**
```
status: "pending" | "approved" | "rejected" (default: "pending")
```

**응답 (200 OK):**
```json
{
  "data": [
    {
      "id": "string",
      "user": {
        "id": "string",
        "name": "string",
        "role": "string"
      },
      "documents": [
        {
          "id": "string",
          "fileName": "string",
          "fileUrl": "string"
        }
      ],
      "status": "pending | approved | rejected",
      "submittedAt": "string (ISO 8601)"
    }
  ],
  "total": "number"
}
```

---

### 8.4 인증 승인
```
PATCH /admin/verifications/:id/approve
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: admin
```

**응답 (200 OK):**
```json
{
  "message": "인증이 승인되었습니다."
}
```

---

### 8.5 인증 반려
```
PATCH /admin/verifications/:id/reject
```

**헤더:**
```
Authorization: Bearer {accessToken}
Role: admin
```

**요청 바디:**
```json
{
  "message": "string"
}
```

**응답 (200 OK):**
```json
{
  "message": "인증이 반려되었습니다."
}
```

---

## 9. 공통 에러 응답

모든 API는 다음과 같은 에러 응답 형식을 따릅니다:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object | null"
  }
}
```

### HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스를 찾을 수 없음
- `409`: 중복 또는 충돌
- `422`: 유효하지 않은 입력값
- `500`: 서버 오류

---

## 10. 데이터 타입 정의

### 사용자 역할 (Role)
```typescript
type UserRole = 'instructor' | 'academy' | 'admin';
```

### 지원 상태 (Application Status)
```typescript
type ApplicationStatus = 'applied' | 'reviewing' | 'accepted' | 'rejected';
```

### 공고 상태 (Job Status)
```typescript
type JobStatus = 'pending' | 'open' | 'closed';
```

### 인증 상태 (Verification Status)
```typescript
type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';
```

### 급여 타입 (Salary Type)
```typescript
type SalaryType = 'hourly' | 'monthly';
```

### 알림 타입 (Notification Type)
```typescript
type NotificationType = 
  | 'application_result'
  | 'verification_result'
  | 'new_job'
  | 'message'
  | 'system';
```

---

## 📝 참고사항

1. **인증**: 모든 보호된 API는 Bearer Token이 필요합니다.
2. **페이지네이션**: 목록 API는 기본적으로 페이지네이션을 지원합니다.
3. **파일 업로드**: multipart/form-data 형식을 사용합니다.
4. **날짜 형식**: ISO 8601 형식 (예: 2025-10-12T10:30:00Z)
5. **에러 처리**: 모든 에러는 일관된 형식으로 반환됩니다.

