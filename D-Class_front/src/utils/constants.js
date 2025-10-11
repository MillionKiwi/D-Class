/**
 * 상수 정의
 */

// 사용자 역할
export const USER_ROLES = {
  INSTRUCTOR: 'instructor', // 강사
  ACADEMY: 'academy', // 학원
  ADMIN: 'admin', // 관리자
}

// 지원 상태 (강사 관점)
export const APPLICATION_STATUS = {
  APPLIED: 'applied', // 지원 완료
  REVIEWING: 'reviewing', // 검토중
  ACCEPTED: 'accepted', // 최종 합격
  REJECTED: 'rejected', // 불합격
}

// 공고 상태
export const JOB_STATUS = {
  DRAFT: 'draft', // 작성중
  PENDING: 'pending', // 검토 대기
  ACTIVE: 'active', // 게시중
  CLOSED: 'closed', // 마감
  HIDDEN: 'hidden', // 숨김
  DELETED: 'deleted', // 삭제
}

// 인증 상태
export const VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified', // 미인증
  PENDING: 'pending', // 인증 대기
  VERIFIED: 'verified', // 인증 완료
  REJECTED: 'rejected', // 인증 반려
}

// 무용 장르
export const DANCE_GENRES = [
  { value: 'ballet', label: '발레' },
  { value: 'modern', label: '현대무용' },
  { value: 'korean', label: '한국무용' },
  { value: 'jazz', label: '재즈댄스' },
  { value: 'hiphop', label: '힙합' },
  { value: 'contemporary', label: '컨템포러리' },
  { value: 'traditional', label: '전통무용' },
  { value: 'etc', label: '기타' },
]

// 근무 시간대
export const WORK_TIMES = [
  { value: 'morning', label: '오전' },
  { value: 'afternoon', label: '오후' },
  { value: 'evening', label: '저녁' },
  { value: 'weekend', label: '주말' },
]

// 지역 (서울/경기/인천)
export const REGIONS = [
  {
    value: 'seoul',
    label: '서울',
    districts: [
      '강남구',
      '강동구',
      '강북구',
      '강서구',
      '관악구',
      '광진구',
      '구로구',
      '금천구',
      '노원구',
      '도봉구',
      '동대문구',
      '동작구',
      '마포구',
      '서대문구',
      '서초구',
      '성동구',
      '성북구',
      '송파구',
      '양천구',
      '영등포구',
      '용산구',
      '은평구',
      '종로구',
      '중구',
      '중랑구',
    ],
  },
  {
    value: 'gyeonggi',
    label: '경기',
    districts: [
      '수원시',
      '성남시',
      '고양시',
      '용인시',
      '부천시',
      '안산시',
      '안양시',
      '남양주시',
      '화성시',
      '평택시',
      '의정부시',
      '시흥시',
      '파주시',
      '김포시',
      '광명시',
      '광주시',
      '군포시',
      '하남시',
      '오산시',
      '양주시',
      '이천시',
      '구리시',
      '안성시',
      '포천시',
      '의왕시',
      '양평군',
      '여주시',
      '동두천시',
      '과천시',
      '가평군',
      '연천군',
    ],
  },
  {
    value: 'incheon',
    label: '인천',
    districts: [
      '중구',
      '동구',
      '미추홀구',
      '연수구',
      '남동구',
      '부평구',
      '계양구',
      '서구',
      '강화군',
      '옹진군',
    ],
  },
]

// 급여 유형
export const SALARY_TYPES = [
  { value: 'hourly', label: '시급' },
  { value: 'monthly', label: '월급' },
]

// 요일
export const WEEKDAYS = [
  { value: 'mon', label: '월' },
  { value: 'tue', label: '화' },
  { value: 'wed', label: '수' },
  { value: 'thu', label: '목' },
  { value: 'fri', label: '금' },
  { value: 'sat', label: '토' },
  { value: 'sun', label: '일' },
]

// 파일 업로드 제한
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf'],
}

// 페이지네이션
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  ADMIN_PAGE_SIZE: 30,
}

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo',
  USER_ROLE: 'userRole',
}

