import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireGuest, requireInstructor, requireAcademy, requireAdmin } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ============================================
    // 홈 & 데모 페이지
    // ============================================
    {
      path: '/',
      name: 'home',
      redirect: '/login',
    },
    {
      path: '/demo',
      name: 'ComponentDemo',
      component: () => import('@/views/ComponentDemo.vue'),
    },
    {
      path: '/layout-demo',
      name: 'LayoutDemo',
      component: () => import('@/views/LayoutDemo.vue'),
    },

    // ============================================
    // 인증 라우트 (P1)
    // ============================================
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginPage.vue'),
      beforeEnter: requireGuest,
      meta: { title: '로그인' },
    },
    {
      path: '/signup',
      name: 'SignupSelectRole',
      component: () => import('@/views/auth/SignupSelectRole.vue'),
      beforeEnter: requireGuest,
      meta: { title: '회원가입 - 역할 선택' },
    },
    {
      path: '/signup/info',
      name: 'SignupInfo',
      component: () => import('@/views/auth/SignupInfo.vue'),
      beforeEnter: requireGuest,
      meta: { title: '회원가입 - 정보 입력' },
    },

    // ============================================
    // 강사 라우트 (P2)
    // ============================================
    {
      path: '/instructor',
      redirect: '/instructor/jobs',
      beforeEnter: requireInstructor,
      meta: { layout: 'instructor' },
    },
    {
      path: '/instructor/jobs',
      name: 'InstructorJobs',
      component: () => import('@/views/instructor/JobList.vue'),
      beforeEnter: requireInstructor,
      meta: { title: '공고 목록', layout: 'instructor' },
    },
    {
      path: '/instructor/jobs/:id',
      name: 'InstructorJobDetail',
      component: () => import('@/views/instructor/JobDetail.vue'),
      beforeEnter: requireInstructor,
      meta: { title: '공고 상세', layout: 'instructor' },
    },
    {
      path: '/instructor/applications',
      name: 'InstructorApplications',
      component: () => import('@/views/instructor/ApplicationList.vue'),
      beforeEnter: requireInstructor,
      meta: { title: '지원 현황', layout: 'instructor' },
    },
    {
      path: '/instructor/favorites',
      name: 'InstructorFavorites',
      component: () => import('@/views/instructor/FavoriteList.vue'),
      beforeEnter: requireInstructor,
      meta: { title: '찜한 공고', layout: 'instructor' },
    },
    {
      path: '/instructor/profile',
      name: 'InstructorProfile',
      component: () => import('@/views/instructor/MyPage.vue'),
      beforeEnter: requireInstructor,
      meta: { title: '마이페이지', layout: 'instructor' },
    },
    {
      path: '/instructor/profile/edit',
      name: 'InstructorProfileEdit',
      component: () => import('@/views/instructor/ProfileEdit.vue'),
      beforeEnter: requireInstructor,
      meta: { title: '프로필 관리', layout: 'instructor' },
    },
    {
      path: '/instructor/verification',
      name: 'InstructorVerification',
      component: () => import('@/views/instructor/VerificationUpload.vue'),
      beforeEnter: requireInstructor,
      meta: { title: '인증 서류 제출', layout: 'instructor' },
    },
    {
      path: '/instructor/reviews',
      name: 'InstructorReviews',
      component: () => import('@/views/instructor/ReviewList.vue'),
      beforeEnter: requireInstructor,
      meta: { title: '내가 작성한 리뷰', layout: 'instructor' },
    },
    {
      path: '/instructor/reviews/write/:academyId',
      name: 'InstructorReviewWrite',
      component: () => import('@/views/instructor/ReviewWrite.vue'),
      beforeEnter: requireInstructor,
      meta: { title: '리뷰 작성', layout: 'instructor' },
    },

    // ============================================
    // 학원 라우트 (P3)
    // ============================================
    {
      path: '/academy',
      redirect: '/academy/jobs',
      beforeEnter: requireAcademy,
      meta: { layout: 'academy' },
    },
    {
      path: '/academy/jobs',
      name: 'AcademyJobs',
      component: () => import('@/views/academy/JobManagement.vue'),
      beforeEnter: requireAcademy,
      meta: { title: '공고 관리', layout: 'academy' },
    },
    {
      path: '/academy/jobs/create',
      name: 'AcademyJobCreate',
      component: () => import('@/views/academy/JobCreate.vue'),
      beforeEnter: requireAcademy,
      meta: { title: '공고 등록', layout: 'academy' },
    },
    {
      path: '/academy/jobs/:id/edit',
      name: 'AcademyJobEdit',
      component: () => import('@/views/academy/JobEdit.vue'),
      beforeEnter: requireAcademy,
      meta: { title: '공고 수정', layout: 'academy' },
    },
    {
      path: '/academy/jobs/:id',
      name: 'AcademyJobDetail',
      component: () => import('@/views/academy/JobDetail.vue'),
      beforeEnter: requireAcademy,
      meta: { title: '공고 상세', layout: 'academy' },
    },
    {
      path: '/academy/applicants',
      name: 'AcademyApplicants',
      component: () => import('@/views/academy/ApplicantManagement.vue'),
      beforeEnter: requireAcademy,
      meta: { title: '지원자 관리', layout: 'academy' },
    },
    {
      path: '/academy/applicants/:id',
      name: 'AcademyApplicantDetail',
      component: () => import('@/views/academy/ApplicantDetail.vue'),
      beforeEnter: requireAcademy,
      meta: { title: '지원자 상세', layout: 'academy' },
    },
    {
      path: '/academy/hired',
      name: 'AcademyHired',
      component: () => import('@/views/academy/HiredList.vue'),
      beforeEnter: requireAcademy,
      meta: { title: '채용 현황', layout: 'academy' },
    },
    {
      path: '/academy/reviews',
      name: 'AcademyReviews',
      component: () => import('@/views/academy/ReviewManagement.vue'),
      beforeEnter: requireAcademy,
      meta: { title: '리뷰 관리', layout: 'academy' },
    },
    {
      path: '/academy/reviews/write/:instructorId',
      name: 'AcademyReviewWrite',
      component: () => import('@/views/academy/ReviewWrite.vue'),
      beforeEnter: requireAcademy,
      meta: { title: '리뷰 작성', layout: 'academy' },
    },
    {
      path: '/academy/profile',
      name: 'AcademyProfile',
      component: () => import('@/views/academy/AcademyManagement.vue'),
      beforeEnter: requireAcademy,
      meta: { title: '학원 관리', layout: 'academy' },
    },
    {
      path: '/academy/profile/edit',
      name: 'AcademyProfileEdit',
      component: () => import('@/views/academy/AcademyEdit.vue'),
      beforeEnter: requireAcademy,
      meta: { title: '학원 정보 관리', layout: 'academy' },
    },
    {
      path: '/academy/verification',
      name: 'AcademyVerification',
      component: () => import('@/views/academy/VerificationUpload.vue'),
      beforeEnter: requireAcademy,
      meta: { title: '사업자 인증', layout: 'academy' },
    },

    // ============================================
    // 관리자 라우트 (P4)
    // ============================================
    {
      path: '/admin',
      redirect: '/admin/dashboard',
      beforeEnter: requireAdmin,
      meta: { layout: 'admin' },
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/Dashboard.vue'),
      beforeEnter: requireAdmin,
      meta: { title: '대시보드', layout: 'admin' },
    },
    {
      path: '/admin/members',
      name: 'AdminMembers',
      component: () => import('@/views/admin/MemberManagement.vue'),
      beforeEnter: requireAdmin,
      meta: { title: '회원 관리', layout: 'admin' },
    },
    {
      path: '/admin/verifications',
      name: 'AdminVerifications',
      component: () => import('@/views/admin/VerificationReview.vue'),
      beforeEnter: requireAdmin,
      meta: { title: '인증 관리', layout: 'admin' },
    },
    {
      path: '/admin/jobs',
      name: 'AdminJobs',
      component: () => import('@/views/admin/JobManagement.vue'),
      beforeEnter: requireAdmin,
      meta: { title: '공고 관리', layout: 'admin' },
    },
    {
      path: '/admin/reviews',
      name: 'AdminReviews',
      component: () => import('@/views/admin/ReviewManagement.vue'),
      beforeEnter: requireAdmin,
      meta: { title: '리뷰 관리', layout: 'admin' },
    },
    {
      path: '/admin/inquiries',
      name: 'AdminInquiries',
      component: () => import('@/views/admin/InquiryManagement.vue'),
      beforeEnter: requireAdmin,
      meta: { title: '문의/신고 관리', layout: 'admin' },
    },

    // ============================================
    // 공통 라우트
    // ============================================
    {
      path: '/search',
      name: 'Search',
      component: () => import('@/views/common/SearchPage.vue'),
      beforeEnter: requireAuth,
      meta: { title: '검색' },
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import('@/views/common/NotificationList.vue'),
      beforeEnter: requireAuth,
      meta: { title: '알림' },
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/common/Settings.vue'),
      beforeEnter: requireAuth,
      meta: { title: '설정' },
    },
    {
      path: '/settings/account',
      name: 'AccountSettings',
      component: () => import('@/views/common/AccountSettings.vue'),
      beforeEnter: requireAuth,
      meta: { title: '계정 설정' },
    },
    {
      path: '/settings/notifications',
      name: 'NotificationSettings',
      component: () => import('@/views/common/NotificationSettings.vue'),
      beforeEnter: requireAuth,
      meta: { title: '알림 설정' },
    },
    {
      path: '/support',
      name: 'Support',
      component: () => import('@/views/common/CustomerSupport.vue'),
      beforeEnter: requireAuth,
      meta: { title: '고객센터' },
    },
    {
      path: '/academy/:id',
      name: 'AcademyPublicProfile',
      component: () => import('@/views/common/AcademyProfile.vue'),
      beforeEnter: requireAuth,
      meta: { title: '학원 프로필' },
    },

    // ============================================
    // 에러 페이지 (P5)
    // ============================================
    {
      path: '/error/404',
      name: 'NotFound',
      component: () => import('@/views/error/NotFound.vue'),
      meta: { title: '페이지를 찾을 수 없습니다' },
    },
    {
      path: '/error/500',
      name: 'ServerError',
      component: () => import('@/views/error/ServerError.vue'),
      meta: { title: '서버 오류' },
    },
    {
      path: '/error/network',
      name: 'NetworkError',
      component: () => import('@/views/error/NetworkError.vue'),
      meta: { title: '네트워크 오류' },
    },
    {
      path: '/maintenance',
      name: 'Maintenance',
      component: () => import('@/views/error/Maintenance.vue'),
      meta: { title: '서비스 점검 중' },
    },

    // 404 Catch-all
    {
      path: '/:pathMatch(.*)*',
      redirect: '/error/404',
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 전역 네비게이션 가드
router.beforeEach((to, from, next) => {
  // 페이지 타이틀 설정
  if (to.meta.title) {
    document.title = `${to.meta.title} - D-Class`
  } else {
    document.title = 'D-Class'
  }

  next()
})

// 에러 핸들링
router.onError((error) => {
  console.error('Router error:', error)
  // TODO: 에러 로깅 서비스에 전송
})

export default router
