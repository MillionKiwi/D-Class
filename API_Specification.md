# D-Class API 명세서 v1.0

## 📋 문서 정보
- 프로젝트명: D-Class (디클래스)
- API 버전: v1.0
- 작성일: 2025년 1월
- 기본 URL: `https://api.d-class.com/api/v1`
- 인증 방식: JWT (JSON Web Token)
- 데이터 형식: JSON

---

## 🔐 인증 (Authentication)

### 1.1 이메일 중복 확인
**GET** `/auth/check-email/?email={email}`

응답 (200 OK):
```json
{
  "available": true,
  "message": "사용 가능한 이메일입니다"
}
```

에러 응답 (400 Bad Request):
```json
{
  "available": false,
  "message": "이미 사용 중인 이메일입니다"
}
```

---

### 1.2 회원가입 - 정보 입력
**POST** `/auth/register/`

요청 본문 (강사):
```json
{
  "role": "instructor",
  "email": "instructor@example.com",
  "password": "SecurePass123!",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "specialties": ["ballet", "contemporary"],
  "terms_agreed": {
    "service": true,
    "privacy": true,
    "marketing": false
  }
}
```

요청 본문 (학원):
```json
{
  "role": "academy",
  "email": "academy@example.com",
  "password": "SecurePass123!",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "academy_name": "예술무용학원",
  "address": "서울시 강남구 테헤란로 123",
  "terms_agreed": {
    "service": true,
    "privacy": true,
    "marketing": false
  }
}
```

응답 (201 Created):
```json
{
  "message": "가입이 완료되었습니다",
  "user_id": 1
}
```

에러 응답 (400 Bad Request):
```json
{
  "email": ["이미 사용 중인 이메일입니다"],
  "password": ["8자 이상, 영문/숫자/특수문자 포함"],
  "terms_agreed": {
    "service": ["필수 약관에 동의해주세요"]
  }
}
```

**참고**: 
- 비밀번호 확인(`password_confirm`)은 프론트엔드에서 검증하며, 백엔드로 전송하지 않습니다.
- 이메일 형식, 비밀번호 강도, 필수 항목 등은 프론트엔드에서 실시간 검증하되, 백엔드에서도 최종 검증을 수행합니다.

---

### 1.3 로그인
**POST** `/auth/login/`

요청 본문:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

응답 (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "role": "instructor",
    "is_verified": false
  }
}
```

에러 응답 (401 Unauthorized):
```json
{
  "detail": "이메일 또는 비밀번호가 올바르지 않습니다"
}
```

---

### 1.4 토큰 갱신
**POST** `/auth/token/refresh/`

요청 본문:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

응답 (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 1.5 로그아웃
**POST** `/auth/logout/`

헤더:
```
Authorization: Bearer {access_token}
```

응답 (200 OK):
```json
{
  "message": "로그아웃되었습니다"
}
```

---

### 1.6 비밀번호 찾기 (이메일 발송)
**POST** `/auth/password/reset/`

요청 본문:
```json
{
  "email": "user@example.com"
}
```

응답 (200 OK):
```json
{
  "message": "비밀번호 재설정 링크가 이메일로 발송되었습니다"
}
```

---

### 1.7 비밀번호 재설정
**POST** `/auth/password/reset/confirm/`

요청 본문:
```json
{
  "token": "reset_token_from_email",
  "password": "NewPassword123!"
}
```

응답 (200 OK):
```json
{
  "message": "비밀번호가 재설정되었습니다"
}
```

---

## 👤 회원 관리 (User/Account)

### 2.1 내 정보 조회
**GET** `/users/me/`

헤더:
```
Authorization: Bearer {access_token}
```

응답 (200 OK) - 강사:
```json
{
  "id": 1,
  "email": "instructor@example.com",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "role": "instructor",
  "profile_image": "https://...",
  "is_verified": true,
  "verification_status": "approved",
  "specialties": ["ballet", "contemporary"],
  "created_at": "2025-01-01T00:00:00Z"
}
```

응답 (200 OK) - 학원:
```json
{
  "id": 2,
  "email": "academy@example.com",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "role": "academy",
  "academy_name": "예술무용학원",
  "academy_image": "https://...",
  "address": "서울시 강남구 테헤란로 123",
  "is_verified": true,
  "verification_status": "approved",
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

### 2.2 프로필 수정 (강사)
**PATCH** `/users/me/profile/`

헤더:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

요청 본문 (Form Data):
```
phone: 010-9876-5432
specialties: ["ballet", "contemporary", "korean"]
bio: 자기소개 내용 (최대 500자)
profile_image: (파일)
```

응답 (200 OK):
```json
{
  "message": "프로필이 저장되었습니다",
  "profile": { ... }
}
```

---

### 2.3 학원 정보 수정
**PATCH** `/users/me/academy/`

헤더:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

요청 본문 (Form Data):
```
academy_name: 예술무용학원
address: 서울시 강남구 테헤란로 456
phone: 02-1234-5678
operating_hours: 09:00-18:00
main_genres: ["ballet", "contemporary"]
description: 학원 소개 (최대 1000자)
facilities: ["parking", "shower", "locker"]
academy_image: (파일)
```

응답 (200 OK):
```json
{
  "message": "학원 정보가 저장되었습니다",
  "academy": { ... }
}
```

---

### 2.4 비밀번호 변경
**POST** `/users/me/password/change/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "old_password": "OldPassword123!",
  "new_password": "NewPassword123!"
}
```

응답 (200 OK):
```json
{
  "message": "비밀번호가 변경되었습니다"
}
```

---

### 2.5 회원 탈퇴
**DELETE** `/users/me/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "password": "CurrentPassword123!"
}
```

응답 (200 OK):
```json
{
  "message": "회원 탈퇴가 완료되었습니다"
}
```

---

## 🎓 강사 프로필 (Instructor Profile)

### 3.1 경력 추가
**POST** `/instructors/me/experiences/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "institution": "서울예술대학교",
  "position": "전임강사",
  "start_date": "2020-01-01",
  "end_date": "2023-12-31",
  "description": "발레 전공 수업 담당"
}
```

응답 (201 Created):
```json
{
  "id": 1,
  "institution": "서울예술대학교",
  "position": "전임강사",
  "start_date": "2020-01-01",
  "end_date": "2023-12-31",
  "description": "발레 전공 수업 담당",
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

### 3.2 경력 수정
**PATCH** `/instructors/me/experiences/{experience_id}/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "position": "주임강사",
  "description": "발레 및 현대무용 수업 담당"
}
```

응답 (200 OK):
```json
{
  "id": 1,
  "institution": "서울예술대학교",
  "position": "주임강사",
  ...
}
```

---

### 3.3 경력 삭제
**DELETE** `/instructors/me/experiences/{experience_id}/`

헤더:
```
Authorization: Bearer {access_token}
```

응답 (204 No Content)

---

### 3.4 학력 추가
**POST** `/instructors/me/educations/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "school": "서울예술대학교",
  "major": "무용학과",
  "degree": "bachelor",
  "start_date": "2016-03-01",
  "end_date": "2020-02-28",
  "description": "발레 전공"
}
```

응답 (201 Created):
```json
{
  "id": 1,
  "school": "서울예술대학교",
  "major": "무용학과",
  "degree": "bachelor",
  "start_date": "2016-03-01",
  "end_date": "2020-02-28",
  "description": "발레 전공",
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

### 3.5 학력 수정
**PATCH** `/instructors/me/educations/{education_id}/`

헤더:
```
Authorization: Bearer {access_token}
```

---

### 3.6 학력 삭제
**DELETE** `/instructors/me/educations/{education_id}/`

헤더:
```
Authorization: Bearer {access_token}
```

---

### 3.7 강사 프로필 조회 (공개)
**GET** `/instructors/{instructor_id}/`

응답 (200 OK):
```json
{
  "id": 1,
  "name": "홍길동",
  "profile_image": "https://...",
  "is_verified": true,
  "specialties": ["ballet", "contemporary"],
  "bio": "자기소개",
  "experiences": [
    {
      "id": 1,
      "institution": "서울예술대학교",
      "position": "전임강사",
      "start_date": "2020-01-01",
      "end_date": "2023-12-31",
      "description": "..."
    }
  ],
  "educations": [
    {
      "id": 1,
      "school": "서울예술대학교",
      "major": "무용학과",
      "degree": "bachelor",
      ...
    }
  ],
  "average_rating": 4.5,
  "review_count": 10,
  "contact_visible": false
}
```

---

## 🏢 학원 프로필 (Academy Profile)

### 4.1 학원 프로필 조회 (공개)
**GET** `/academies/{academy_id}/`

응답 (200 OK):
```json
{
  "id": 1,
  "academy_name": "예술무용학원",
  "academy_image": "https://...",
  "is_verified": true,
  "address": "서울시 강남구 테헤란로 123",
  "phone": "02-1234-5678",
  "operating_hours": "09:00-18:00",
  "main_genres": ["ballet", "contemporary"],
  "description": "학원 소개",
  "facilities": ["parking", "shower", "locker"],
  "average_rating": 4.8,
  "review_count": 25,
  "job_postings": [
    {
      "id": 1,
      "title": "주말 발레 강사 모집",
      "genres": ["ballet"],
      "salary": 50000,
      "status": "active"
    }
  ],
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "content": "좋은 학원입니다",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

## 📋 공고 관리 (Job Posting)

### 5.1 공고 목록 조회 (강사용)
**GET** `/job-postings/`

쿼리 파라미터:
- `page`: 페이지 번호 (기본값: 1)
- `page_size`: 페이지당 항목 수 (기본값: 20)
- `region`: 지역 필터 (예: "seoul", "gyeonggi")
- `district`: 시/구 필터 (예: "gangnam")
- `genre`: 장르 필터 (예: "ballet", "contemporary")
- `work_time`: 근무 시간 필터 (예: "morning", "afternoon", "evening", "weekend")
- `ordering`: 정렬 옵션 (예: "-created_at", "-salary")
- `search`: 검색 키워드
- `lat`: 위도 (지도 뷰용)
- `lng`: 경도 (지도 뷰용)
- `radius`: 반경 (km, 지도 뷰용)

헤더 (선택):
```
Authorization: Bearer {access_token}
```

응답 (200 OK):
```json
{
  "count": 100,
  "next": "https://api.d-class.com/api/v1/job-postings/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "주말 발레 강사 모집",
      "academy": {
        "id": 1,
        "name": "예술무용학원",
        "is_verified": true
      },
      "region": "seoul",
      "district": "gangnam",
      "genres": ["ballet"],
      "work_days": ["saturday", "sunday"],
      "work_time": "14:00-18:00",
      "salary_type": "hourly",
      "salary": 50000,
      "created_at": "2025-01-01T00:00:00Z",
      "status": "active",
      "is_applied": false,
      "is_favorited": false,
      "location": {
        "lat": 37.5665,
        "lng": 126.9780
      }
    }
  ]
}
```

---

### 5.2 공고 상세 조회
**GET** `/job-postings/{posting_id}/`

헤더 (선택):
```
Authorization: Bearer {access_token}
```

응답 (200 OK):
```json
{
  "id": 1,
  "title": "주말 발레 강사 모집",
  "academy": {
    "id": 1,
    "name": "예술무용학원",
    "is_verified": true,
    "average_rating": 4.8,
    "review_count": 25,
    "address": "서울시 강남구 테헤란로 123",
    "location": {
      "lat": 37.5665,
      "lng": 126.9780
    }
  },
  "region": "seoul",
  "district": "gangnam",
  "genres": ["ballet"],
  "classes": "초등반, 성인취미반",
  "work_days": ["saturday", "sunday"],
  "work_time": "14:00-18:00",
  "salary_type": "hourly",
  "salary": 50000,
  "preferred_qualifications": "경력 3년 이상",
  "description": "상세 설명",
  "created_at": "2025-01-01T00:00:00Z",
  "status": "active",
  "is_applied": false,
  "is_favorited": false,
  "application_count": 5
}
```

---

### 5.3 공고 등록 (학원)
**POST** `/job-postings/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "title": "주말 발레 강사 모집",
  "region": "seoul",
  "district": "gangnam",
  "genres": ["ballet"],
  "classes": "초등반, 성인취미반",
  "work_days": ["saturday", "sunday"],
  "work_time": "14:00-18:00",
  "salary_type": "hourly",
  "salary": 50000,
  "preferred_qualifications": "경력 3년 이상",
  "description": "상세 설명",
  "address": "서울시 강남구 테헤란로 123",
  "lat": 37.5665,
  "lng": 126.9780
}
```

응답 (201 Created):
```json
{
  "id": 1,
  "title": "주말 발레 강사 모집",
  "status": "pending",
  "message": "관리자 검토 후 공고가 게시됩니다",
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

### 5.4 공고 수정 (학원)
**PATCH** `/job-postings/{posting_id}/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "title": "주말 발레 강사 모집 (수정)",
  "salary": 55000
}
```

응답 (200 OK):
```json
{
  "id": 1,
  "title": "주말 발레 강사 모집 (수정)",
  ...
}
```

---

### 5.5 공고 삭제 (학원)
**DELETE** `/job-postings/{posting_id}/`

헤더:
```
Authorization: Bearer {access_token}
```

응답 (204 No Content)

---

### 5.6 공고 마감 (학원)
**POST** `/job-postings/{posting_id}/close/`

헤더:
```
Authorization: Bearer {access_token}
```

응답 (200 OK):
```json
{
  "message": "공고가 마감되었습니다",
  "status": "closed"
}
```

---

### 5.7 내 공고 목록 (학원)
**GET** `/job-postings/my/`

헤더:
```
Authorization: Bearer {access_token}
```

쿼리 파라미터:
- `status`: 상태 필터 (예: "active", "pending", "closed")
- `page`: 페이지 번호
- `page_size`: 페이지당 항목 수

응답 (200 OK):
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "title": "주말 발레 강사 모집",
      "status": "active",
      "application_count": 5,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

## 📝 지원 관리 (Application)

### 6.1 공고 지원 (강사)
**POST** `/applications/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "job_posting": 1
}
```

응답 (201 Created):
```json
{
  "id": 1,
  "job_posting": {
    "id": 1,
    "title": "주말 발레 강사 모집"
  },
  "status": "pending",
  "message": "지원이 완료되었습니다",
  "created_at": "2025-01-01T00:00:00Z"
}
```

에러 응답 (400 Bad Request):
```json
{
  "detail": "이미 지원한 공고입니다"
}
```

---

### 6.2 지원 현황 조회 (강사)
**GET** `/applications/my/`

헤더:
```
Authorization: Bearer {access_token}
```

쿼리 파라미터:
- `status`: 상태 필터 (예: "pending", "reviewing", "accepted", "rejected")
- `page`: 페이지 번호
- `page_size`: 페이지당 항목 수

응답 (200 OK):
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "job_posting": {
        "id": 1,
        "title": "주말 발레 강사 모집",
        "academy": {
          "id": 1,
          "name": "예술무용학원",
          "is_verified": true
        }
      },
      "status": "reviewing",
      "created_at": "2025-01-01T00:00:00Z",
      "can_review": false
    }
  ]
}
```

---

### 6.3 지원자 목록 조회 (학원)
**GET** `/applications/`

헤더:
```
Authorization: Bearer {access_token}
```

쿼리 파라미터:
- `job_posting`: 공고 ID 필터
- `status`: 상태 필터 (예: "new", "reviewing", "accepted", "rejected")
- `page`: 페이지 번호
- `page_size`: 페이지당 항목 수

응답 (200 OK):
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "instructor": {
        "id": 1,
        "name": "홍길동",
        "profile_image": "https://...",
        "is_verified": true,
        "specialties": ["ballet", "contemporary"]
      },
      "job_posting": {
        "id": 1,
        "title": "주말 발레 강사 모집"
      },
      "status": "new",
      "created_at": "2025-01-01T00:00:00Z",
      "is_new": true
    }
  ]
}
```

---

### 6.4 지원자 상세 조회 (학원)
**GET** `/applications/{application_id}/`

헤더:
```
Authorization: Bearer {access_token}
```

응답 (200 OK):
```json
{
  "id": 1,
  "instructor": {
    "id": 1,
    "name": "홍길동",
    "profile_image": "https://...",
    "is_verified": true,
    "specialties": ["ballet", "contemporary"],
    "bio": "자기소개",
    "phone": "010-****-5678",
    "contact_visible": false,
    "experiences": [...],
    "educations": [...],
    "average_rating": 4.5,
    "review_count": 10
  },
  "job_posting": {
    "id": 1,
    "title": "주말 발레 강사 모집"
  },
  "status": "reviewing",
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

### 6.5 채용 확정 (학원)
**POST** `/applications/{application_id}/accept/`

헤더:
```
Authorization: Bearer {access_token}
```

응답 (200 OK):
```json
{
  "message": "채용이 확정되었습니다",
  "status": "accepted",
  "contact_visible": true
}
```

---

### 6.6 불합격 처리 (학원)
**POST** `/applications/{application_id}/reject/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "reason": "불합격 사유 (선택)"
}
```

응답 (200 OK):
```json
{
  "message": "불합격 처리되었습니다",
  "status": "rejected"
}
```

---

## ⭐ 리뷰 (Review)

### 7.1 리뷰 작성 (강사 → 학원)
**POST** `/reviews/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "application_id": 1,
  "rating": 5,
  "content": "좋은 학원입니다. 수업 분위기도 좋고..."
}
```

응답 (201 Created):
```json
{
  "id": 1,
  "academy": {
    "id": 1,
    "name": "예술무용학원"
  },
  "rating": 5,
  "content": "좋은 학원입니다. 수업 분위기도 좋고...",
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

### 7.2 리뷰 작성 (학원 → 강사)
**POST** `/reviews/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "application_id": 1,
  "rating": 5,
  "content": "전문성이 뛰어난 강사입니다..."
}
```

응답 (201 Created):
```json
{
  "id": 2,
  "instructor": {
    "id": 1,
    "name": "홍길동"
  },
  "rating": 5,
  "content": "전문성이 뛰어난 강사입니다...",
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

### 7.3 리뷰 목록 조회 (학원)
**GET** `/reviews/academy/{academy_id}/`

쿼리 파라미터:
- `ordering`: 정렬 옵션 (예: "-created_at", "rating", "-rating")
- `page`: 페이지 번호
- `page_size`: 페이지당 항목 수

응답 (200 OK):
```json
{
  "academy": {
    "id": 1,
    "name": "예술무용학원",
    "average_rating": 4.8,
    "review_count": 25
  },
  "rating_distribution": {
    "5": 15,
    "4": 7,
    "3": 2,
    "2": 1,
    "1": 0
  },
  "count": 25,
  "results": [
    {
      "id": 1,
      "author": "강사***",
      "rating": 5,
      "content": "좋은 학원입니다",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### 7.4 리뷰 목록 조회 (강사)
**GET** `/reviews/instructor/{instructor_id}/`

쿼리 파라미터:
- `ordering`: 정렬 옵션
- `page`: 페이지 번호
- `page_size`: 페이지당 항목 수

응답 (200 OK):
```json
{
  "instructor": {
    "id": 1,
    "name": "홍길동",
    "average_rating": 4.5,
    "review_count": 10
  },
  "count": 10,
  "results": [...]
}
```

---

### 7.5 내가 작성한 리뷰 목록
**GET** `/reviews/my/`

헤더:
```
Authorization: Bearer {access_token}
```

쿼리 파라미터:
- `page`: 페이지 번호
- `page_size`: 페이지당 항목 수

응답 (200 OK):
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "academy": {
        "id": 1,
        "name": "예술무용학원",
        "is_verified": true
      },
      "rating": 5,
      "content": "좋은 학원입니다",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### 7.6 리뷰 수정
**PATCH** `/reviews/{review_id}/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "rating": 4,
  "content": "수정된 리뷰 내용"
}
```

응답 (200 OK):
```json
{
  "id": 1,
  "rating": 4,
  "content": "수정된 리뷰 내용",
  "updated_at": "2025-01-02T00:00:00Z"
}
```

---

### 7.7 리뷰 삭제
**DELETE** `/reviews/{review_id}/`

헤더:
```
Authorization: Bearer {access_token}
```

응답 (204 No Content)

---

## ✅ 인증 서류 (Verification)

### 8.1 인증 서류 제출 (강사)
**POST** `/verifications/instructor/`

헤더:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

요청 본문 (Form Data):
```
files: (파일1, 파일2, ...)
```

응답 (201 Created):
```json
{
  "id": 1,
  "status": "pending",
  "message": "인증 신청이 완료되었습니다. 검토까지 1-2일 소요됩니다",
  "files": [
    {
      "id": 1,
      "file": "https://...",
      "file_name": "졸업증명서.pdf",
      "file_size": 1024000
    }
  ],
  "created_at": "2025-01-01T00:00:00Z"
}
```

에러 응답 (400 Bad Request):
```json
{
  "files": ["파일 크기는 10MB 이하만 가능합니다"],
  "detail": "JPG, PNG, PDF 파일만 업로드 가능합니다"
}
```

---

### 8.2 인증 상태 조회 (강사)
**GET** `/verifications/instructor/me/`

헤더:
```
Authorization: Bearer {access_token}
```

응답 (200 OK):
```json
{
  "id": 1,
  "status": "pending",
  "rejection_reason": null,
  "files": [...],
  "created_at": "2025-01-01T00:00:00Z",
  "reviewed_at": null
}
```

---

### 8.3 인증 서류 재제출 (강사)
**POST** `/verifications/instructor/me/resubmit/`

헤더:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

요청 본문 (Form Data):
```
files: (파일1, 파일2, ...)
```

응답 (200 OK):
```json
{
  "id": 1,
  "status": "pending",
  "message": "재신청이 완료되었습니다",
  ...
}
```

---

### 8.4 인증 서류 제출 (학원)
**POST** `/verifications/academy/`

헤더:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

요청 본문 (Form Data):
```
files: (사업자등록증 파일)
```

응답 (201 Created):
```json
{
  "id": 1,
  "status": "pending",
  "message": "인증 신청이 완료되었습니다. 검토까지 1-2일 소요됩니다",
  ...
}
```

---

### 8.5 인증 상태 조회 (학원)
**GET** `/verifications/academy/me/`

헤더:
```
Authorization: Bearer {access_token}
```

---

## ❤️ 찜 (Favorite)

### 9.1 찜 추가/제거
**POST** `/favorites/toggle/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "job_posting": 1
}
```

응답 (200 OK):
```json
{
  "is_favorited": true,
  "message": "찜 목록에 추가되었습니다"
}
```

---

### 9.2 찜한 공고 목록
**GET** `/favorites/`

헤더:
```
Authorization: Bearer {access_token}
```

쿼리 파라미터:
- `page`: 페이지 번호
- `page_size`: 페이지당 항목 수

응답 (200 OK):
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "job_posting": {
        "id": 1,
        "title": "주말 발레 강사 모집",
        "academy": {
          "id": 1,
          "name": "예술무용학원",
          "is_verified": true
        },
        "genres": ["ballet"],
        "salary": 50000,
        "created_at": "2025-01-01T00:00:00Z"
      },
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

## 🔔 알림 (Notification)

### 10.1 알림 목록 조회
**GET** `/notifications/`

헤더:
```
Authorization: Bearer {access_token}
```

쿼리 파라미터:
- `is_read`: 읽음 여부 필터 (true/false)
- `page`: 페이지 번호
- `page_size`: 페이지당 항목 수

응답 (200 OK):
```json
{
  "unread_count": 5,
  "count": 20,
  "results": [
    {
      "id": 1,
      "type": "application_accepted",
      "title": "지원 결과 알림",
      "content": "예술무용학원의 '주말 발레 강사 모집' 공고에 최종 합격하셨습니다",
      "is_read": false,
      "related_url": "/applications/1",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### 10.2 알림 읽음 처리
**PATCH** `/notifications/{notification_id}/read/`

헤더:
```
Authorization: Bearer {access_token}
```

응답 (200 OK):
```json
{
  "id": 1,
  "is_read": true
}
```

---

### 10.3 모든 알림 읽음 처리
**POST** `/notifications/read-all/`

헤더:
```
Authorization: Bearer {access_token}
```

응답 (200 OK):
```json
{
  "message": "모든 알림이 읽음 처리되었습니다",
  "read_count": 5
}
```

---

### 10.4 알림 삭제
**DELETE** `/notifications/{notification_id}/`

헤더:
```
Authorization: Bearer {access_token}
```

응답 (204 No Content)

---

### 10.5 알림 설정 조회
**GET** `/notifications/settings/`

헤더:
```
Authorization: Bearer {access_token}
```

응답 (200 OK):
```json
{
  "application_result": true,
  "verification_result": true,
  "new_posting": true,
  "marketing": false
}
```

---

### 10.6 알림 설정 수정
**PATCH** `/notifications/settings/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "application_result": true,
  "verification_result": true,
  "new_posting": false,
  "marketing": false
}
```

응답 (200 OK):
```json
{
  "message": "설정이 저장되었습니다",
  "settings": {
    "application_result": true,
    "verification_result": true,
    "new_posting": false,
    "marketing": false
  }
}
```

---

## 🔍 검색 (Search)

### 11.1 검색어 자동완성
**GET** `/search/autocomplete/?q={keyword}`

응답 (200 OK):
```json
{
  "suggestions": [
    "발레 강사",
    "현대무용",
    "서울 강남"
  ]
}
```

---

### 11.2 인기 검색어 조회
**GET** `/search/popular/`

응답 (200 OK):
```json
{
  "keywords": [
    {
      "keyword": "발레 강사",
      "count": 150
    },
    {
      "keyword": "서울 강남",
      "count": 120
    }
  ]
}
```

**참고**: 최근 검색어는 프론트엔드에서 LocalStorage를 사용하여 관리합니다.

---

## 📄 공통 (Common)

### 12.1 이용약관 조회
**GET** `/terms/service/`

응답 (200 OK):
```json
{
  "title": "이용약관",
  "content": "이용약관 내용...",
  "version": "1.0",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

---

### 12.2 개인정보처리방침 조회
**GET** `/terms/privacy/`

응답 (200 OK):
```json
{
  "title": "개인정보처리방침",
  "content": "개인정보처리방침 내용...",
  "version": "1.0",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

---

### 12.3 FAQ 목록 조회
**GET** `/faq/`

응답 (200 OK):
```json
{
  "categories": [
    {
      "id": 1,
      "name": "회원가입",
      "faqs": [
        {
          "id": 1,
          "question": "회원가입은 어떻게 하나요?",
          "answer": "회원가입 방법 설명..."
        }
      ]
    }
  ]
}
```

---

### 12.4 1:1 문의 등록
**POST** `/inquiries/`

헤더:
```
Authorization: Bearer {access_token}
```

요청 본문:
```json
{
  "category": "account",
  "title": "문의 제목",
  "content": "문의 내용"
}
```

응답 (201 Created):
```json
{
  "id": 1,
  "message": "문의가 등록되었습니다",
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

## 🗺️ 지도 (Map)

### 13.1 지도용 공고 목록 (지도 뷰)
**GET** `/job-postings/map/`

쿼리 파라미터:
- `north`: 북쪽 위도
- `south`: 남쪽 위도
- `east`: 동쪽 경도
- `west`: 서쪽 경도
- `zoom`: 줌 레벨
- `filters`: 필터 JSON (지역, 장르 등)

응답 (200 OK):
```json
{
  "postings": [
    {
      "id": 1,
      "title": "주말 발레 강사 모집",
      "location": {
        "lat": 37.5665,
        "lng": 126.9780
      },
      "academy": {
        "id": 1,
        "name": "예술무용학원",
        "is_verified": true
      },
      "salary": 50000
    }
  ],
  "clusters": [
    {
      "center": {
        "lat": 37.5665,
        "lng": 126.9780
      },
      "count": 5,
      "posting_ids": [1, 2, 3, 4, 5]
    }
  ]
}
```

---

## 📊 통계 (Statistics) - 관리자용

### 14.1 대시보드 통계
**GET** `/admin/dashboard/stats/`

헤더:
```
Authorization: Bearer {admin_access_token}
```

응답 (200 OK):
```json
{
  "total_users": {
    "instructors": 500,
    "academies": 200,
    "total": 700
  },
  "pending_verifications": 15,
  "active_postings": 150,
  "new_registrations_this_week": 25,
  "weekly_change": {
    "users": 5.2,
    "postings": -2.1
  }
}
```

---

## ⚠️ 에러 응답 형식

모든 에러 응답은 다음 형식을 따릅니다:

```json
{
  "detail": "에러 메시지",
  "code": "ERROR_CODE",
  "field_errors": {
    "field_name": ["필드별 에러 메시지"]
  }
}
```

### 주요 HTTP 상태 코드
- `200 OK`: 성공
- `201 Created`: 생성 성공
- `204 No Content`: 삭제 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 필요
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `500 Internal Server Error`: 서버 오류

---

## 📝 데이터 모델 참고

### 역할 (Role)
- `instructor`: 강사
- `academy`: 학원
- `admin`: 관리자

### 공고 상태 (Job Posting Status)
- `draft`: 작성중
- `pending`: 검토 대기
- `active`: 게시중
- `closed`: 마감
- `hidden`: 숨김
- `deleted`: 삭제

### 지원 상태 (Application Status)
- `pending`: 지원 완료 (강사 관점) / 새 지원 (학원 관점)
- `reviewing`: 검토중
- `accepted`: 최종 합격 / 채용 확정
- `rejected`: 불합격

### 인증 상태 (Verification Status)
- `none`: 미인증
- `pending`: 인증 대기
- `approved`: 인증 완료
- `rejected`: 인증 반려

### 무용 장르 (Genre)
- `ballet`: 발레
- `contemporary`: 현대무용
- `korean`: 한국무용
- `jazz`: 재즈댄스
- `hiphop`: 힙합
- `ballroom`: 볼룸댄스
- `etc`: 기타

### 지역 (Region)
- `seoul`: 서울
- `gyeonggi`: 경기
- `incheon`: 인천
- `busan`: 부산
- `etc`: 기타

### 급여 유형 (Salary Type)
- `hourly`: 시급
- `monthly`: 월급

### 알림 유형 (Notification Type)
- `application_accepted`: 지원 합격
- `application_rejected`: 지원 불합격
- `verification_approved`: 인증 승인
- `verification_rejected`: 인증 반려
- `new_posting`: 새 공고 알림
- `new_application`: 새 지원 알림 (학원)

---

## 🔒 보안 고려사항

1. **JWT 토큰**
   - Access Token: 15분 유효
   - Refresh Token: 7일 유효
   - 토큰은 HTTP-only 쿠키 또는 로컬 스토리지에 저장

2. **인증 필요 엔드포인트**
   - 모든 `/users/me/`, `/instructors/me/`, `/applications/`, `/reviews/`, `/favorites/`, `/notifications/` 엔드포인트는 인증 필요

3. **권한 검증**
   - 학원은 자신의 공고만 수정/삭제 가능
   - 강사는 자신의 프로필만 수정 가능
   - 리뷰는 작성자만 수정/삭제 가능

4. **파일 업로드**
   - 최대 파일 크기: 10MB
   - 허용 형식: JPG, PNG, PDF
   - 파일은 암호화되어 저장

5. **Rate Limiting**
   - 일반 API: 분당 60회
   - 인증 API: 분당 5회
   - 파일 업로드: 시간당 10회

---

## 📅 버전 히스토리

- **v1.0** (2025년 1월): 초기 API 명세서 작성

---

## 💡 프론트엔드 처리 가이드

다음 항목들은 프론트엔드에서 처리하며, 백엔드 API 호출이 불필요합니다:

### 클라이언트 측 검증 (백엔드 최종 검증 병행)
- **비밀번호 일치 확인**: `password_confirm` 필드는 프론트엔드에서만 검증
- **이메일 형식 검증**: 실시간 형식 검증 (정규식)
- **비밀번호 강도 표시**: 실시간 강도 표시 (약함/보통/강함)
- **전화번호 형식**: 자동 포맷팅 (010-1234-5678)
- **글자 수 제한**: 실시간 카운터 표시 및 제한
- **필수 항목 검증**: 제출 버튼 활성화/비활성화
- **약관 동의 UI**: 체크박스 상태 관리
- **날짜 유효성**: 시작일/종료일 검증
- **파일 크기/형식**: 업로드 전 검증 (백엔드 최종 검증 필수)

### 클라이언트 측 상태 관리
- **역할 선택**: 회원가입 단계에서 상태 관리 (별도 API 불필요)
- **변경사항 감지**: 프로필 수정 시 원본과 비교
- **필터링/정렬**: 상태 관리 후 쿼리 파라미터로 API 호출
- **페이지네이션**: 페이지 번호 상태 관리
- **검색어 Debounce**: 500ms 대기 후 API 호출
- **최근 검색어**: LocalStorage에 저장 (서버 저장 불필요)
- **뷰 전환**: 리스트/지도 뷰 상태 관리
- **지도 클러스터링**: 지도 라이브러리에서 처리
- **상태별 탭**: 탭 상태에 따라 쿼리 파라미터 변경

### 제거된 API 엔드포인트
- `POST /auth/register/role/` - 역할 선택 (프론트엔드 상태 관리)
- `GET /search/recent/` - 최근 검색어 조회 (LocalStorage 사용)
- `DELETE /search/recent/{keyword}/` - 최근 검색어 삭제 (LocalStorage 사용)

자세한 내용은 `API_Optimization_Notes.md` 파일을 참고하세요.

---

## 📞 추가 문의

API 관련 문의는 프로젝트 팀에게 전달해주세요.

