export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    CHECK_EMAIL: '/auth/check-email/',
    REGISTER: '/auth/register/',
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/token/refresh/',
    PASSWORD_RESET: '/auth/password/reset/',
    PASSWORD_RESET_CONFIRM: '/auth/password/reset/confirm/',
  },
  // 회원 관리
  USERS: {
    ME: '/users/me/',
    PROFILE: '/users/me/profile/',
    ACADEMY: '/users/me/academy/',
    PASSWORD_CHANGE: '/users/me/password/change/',
    DELETE: '/users/me/delete/',
  },
  // 강사 프로필
  INSTRUCTORS: {
    ME_EXPERIENCES: '/instructors/me/experiences/',
    ME_EDUCATIONS: '/instructors/me/educations/',
    EXPERIENCE: (id) => `/instructors/me/experiences/${id}/`,
    EDUCATION: (id) => `/instructors/me/educations/${id}/`,
    DETAIL: (id) => `/instructors/${id}/`,
  },
  // 학원 프로필
  ACADEMIES: {
    DETAIL: (id) => `/academies/${id}/`,
  },
  // 공고
  JOB_POSTINGS: {
    LIST: '/job-postings/',
    DETAIL: (id) => `/job-postings/${id}/`,
    MY: '/job-postings/my/',
    MAP: '/job-postings/map/',
    CLOSE: (id) => `/job-postings/${id}/close/`,
  },
  // 지원
  APPLICATIONS: {
    CREATE: '/applications/',
    MY: '/applications/my/',
    LIST: '/applications/',
    DETAIL: (id) => `/applications/${id}/`,
    ACCEPT: (id) => `/applications/${id}/accept/`,
    REJECT: (id) => `/applications/${id}/reject/`,
    CANCEL: (id) => `/applications/${id}/cancel/`,
  },
  // 리뷰
  REVIEWS: {
    CREATE: '/reviews/',
    DETAIL: (id) => `/reviews/${id}/`,
    UPDATE: (id) => `/reviews/${id}/`,
    DELETE: (id) => `/reviews/${id}/`,
    MY: '/reviews/my/',
    ACADEMY: (id) => `/reviews/academy/${id}/`,
    INSTRUCTOR: (id) => `/reviews/instructor/${id}/`,
  },
  // 인증 서류
  VERIFICATIONS: {
    INSTRUCTOR: '/verifications/instructor/',
    INSTRUCTOR_ME: '/verifications/instructor/me/',
    INSTRUCTOR_RESUBMIT: '/verifications/instructor/me/resubmit/',
    ACADEMY: '/verifications/academy/',
    ACADEMY_ME: '/verifications/academy/me/',
  },
  // 찜
  FAVORITES: {
    TOGGLE: '/favorites/toggle/',
    LIST: '/favorites/',
  },
  // 알림
  NOTIFICATIONS: {
    LIST: '/notifications/',
    READ: (id) => `/notifications/${id}/read/`,
    READ_ALL: '/notifications/read-all/',
    DELETE: (id) => `/notifications/${id}/`,
    SETTINGS: '/notifications/settings/',
  },
  // 검색
  SEARCH: {
    AUTOCOMPLETE: '/search/autocomplete/',
    POPULAR: '/search/popular/',
  },
  // 공통
  COMMON: {
    TERMS_SERVICE: '/terms/service/',
    TERMS_PRIVACY: '/terms/privacy/',
    FAQ: '/faq/',
    INQUIRIES: '/inquiries/',
  },
}
