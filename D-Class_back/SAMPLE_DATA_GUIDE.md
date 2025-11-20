# 샘플 데이터 가이드

테스트를 위한 샘플 데이터를 생성하고 관리하는 방법입니다.

## 샘플 데이터 생성

### 기본 사용법

```bash
cd D-Class_back
source ../venv/bin/activate
python manage.py seed_data
```

### 기존 데이터 삭제 후 재생성

```bash
python manage.py seed_data --clear
```

## 생성되는 샘플 데이터

### 1. 약관 데이터
- 이용약관
- 개인정보처리방침

### 2. FAQ 데이터
- 회원가입 관련 FAQ (2개)
- 공고/지원 관련 FAQ (2개)
- 인증 관련 FAQ (2개)
- 기타 FAQ (1개)

### 3. 강사 사용자 (5명)

| 이메일 | 이름 | 비밀번호 | 전문 분야 | 인증 상태 |
|--------|------|----------|-----------|-----------|
| instructor1@example.com | 김발레 | test123! | 발레, 현대무용 | 인증 완료 |
| instructor2@example.com | 이현대 | test123! | 현대무용, 한국무용 | 인증 완료 |
| instructor3@example.com | 박재즈 | test123! | 재즈댄스, 힙합 | 인증 대기 |
| instructor4@example.com | 최한국 | test123! | 한국무용 | 인증 완료 |
| instructor5@example.com | 정볼룸 | test123! | 볼룸댄스 | 인증 완료 |

**강사 프로필 정보**:
- 김발레: 경력 2개, 학력 1개
- 이현대: 경력 1개, 학력 1개
- 최한국: 경력 1개, 학력 1개

### 4. 학원 사용자 (4개)

| 이메일 | 이름 | 학원명 | 비밀번호 | 인증 상태 |
|--------|------|--------|----------|-----------|
| academy1@example.com | 홍길동 | 서울 발레 아카데미 | test123! | 인증 완료 |
| academy2@example.com | 김학원 | 현대무용 스튜디오 | test123! | 인증 완료 |
| academy3@example.com | 이무용 | 한국무용 전수관 | test123! | 인증 대기 |
| academy4@example.com | 박댄스 | 힙합 댄스 아카데미 | test123! | 인증 완료 |

**학원 위치**:
- 서울 발레 아카데미: 강남구 테헤란로
- 현대무용 스튜디오: 마포구 홍대입구
- 한국무용 전수관: 종로구 인사동
- 힙합 댄스 아카데미: 강동구 천호대로

### 5. 공고 데이터 (7개)

| 제목 | 학원 | 상태 | 급여 |
|------|------|------|------|
| 주말 발레 강사 모집 | 서울 발레 아카데미 | 게시중 | 50,000원/시간 |
| 평일 저녁 발레 강사 모집 | 서울 발레 아카데미 | 게시중 | 60,000원/시간 |
| 현대무용 강사 모집 | 현대무용 스튜디오 | 게시중 | 55,000원/시간 |
| 재즈댄스 주말 강사 모집 | 현대무용 스튜디오 | 게시중 | 45,000원/시간 |
| 한국무용 강사 모집 | 한국무용 전수관 | 검토 대기 | 3,000,000원/월 |
| 힙합 댄스 강사 모집 | 힙합 댄스 아카데미 | 게시중 | 50,000원/시간 |
| 재즈댄스 저녁 강사 모집 | 힙합 댄스 아카데미 | 마감 | 55,000원/시간 |

### 6. 지원 데이터 (6개)

- 김발레 → 주말 발레 강사 모집 (채용 확정)
- 이현대 → 주말 발레 강사 모집 (검토중)
- 김발레 → 현대무용 강사 모집 (채용 확정)
- 박재즈 → 재즈댄스 주말 강사 모집 (지원 완료)
- 최한국 → 힙합 댄스 강사 모집 (검토중)
- 정볼룸 → 힙합 댄스 강사 모집 (불합격)

### 7. 리뷰 데이터 (4개)

- 채용 확정된 지원에 대한 양방향 리뷰 2건

### 8. 찜 데이터 (4개)

- 여러 강사가 여러 공고를 찜한 데이터

## 테스트 계정

### 관리자 계정
- 이메일: `admin@dclass.com`
- 비밀번호: `admin123!`

### 강사 계정 (테스트용)
- 이메일: `instructor1@example.com`
- 비밀번호: `test123!`

### 학원 계정 (테스트용)
- 이메일: `academy1@example.com`
- 비밀번호: `test123!`

## 데이터 확인 방법

### 1. Django Admin에서 확인

```bash
# Admin 페이지 접속
http://localhost:8000/admin/

# 로그인: admin@dclass.com / admin123!
```

### 2. API로 확인

```bash
# 공고 목록 조회
curl http://localhost:8000/api/v1/job-postings/

# 강사 프로필 조회
curl http://localhost:8000/api/v1/instructors/2/

# 학원 프로필 조회
curl http://localhost:8000/api/v1/academies/6/
```

### 3. Django Shell에서 확인

```bash
python manage.py shell

# 예시
from users.models import User
from job_postings.models import JobPosting

# 강사 목록
instructors = User.objects.filter(role='instructor')
for instructor in instructors:
    print(f"{instructor.name} ({instructor.email})")

# 공고 목록
postings = JobPosting.objects.filter(status='active')
for posting in postings:
    print(f"{posting.title} - {posting.academy.academy_profile.academy_name}")
```

## 데이터 재생성

기존 데이터를 모두 삭제하고 새로 생성하려면:

```bash
python manage.py seed_data --clear
```

**주의**: `--clear` 옵션은 관리자 계정을 제외한 모든 데이터를 삭제합니다.

## 커스터마이징

`common/management/commands/seed_data.py` 파일을 수정하여 원하는 샘플 데이터를 추가하거나 변경할 수 있습니다.

### 데이터 추가 예시

```python
# seed_data.py의 create_instructors 메서드에 추가
{
    'email': 'new_instructor@example.com',
    'name': '새강사',
    'phone': '010-9999-9999',
    'password': 'test123!',
    'specialties': ['ballet'],
    'bio': '새로운 강사입니다.',
    # ...
}
```

## 문제 해결

### 중복 데이터 오류

이미 존재하는 데이터가 있어 오류가 발생하는 경우:

```bash
# 기존 데이터 삭제 후 재생성
python manage.py seed_data --clear
```

### 외래키 제약 오류

데이터 생성 순서 문제로 오류가 발생하는 경우, `seed_data.py`의 데이터 생성 순서를 확인하세요.

## 다음 단계

1. 프론트엔드에서 로그인 테스트
2. 공고 목록 조회 테스트
3. 지원 기능 테스트
4. 리뷰 기능 테스트

