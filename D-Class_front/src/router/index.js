import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresAuth: false, hideNav: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { requiresAuth: false, hideNav: true },
    },
    {
      path: '/register/role',
      name: 'RegisterRole',
      component: () => import('@/views/auth/RegisterRoleView.vue'),
      meta: { requiresAuth: false, hideNav: true },
    },
    {
      path: '/register/info',
      name: 'RegisterInfo',
      component: () => import('@/views/auth/RegisterInfoView.vue'),
      meta: { requiresAuth: false, hideNav: true },
    },
    // 강사 회원
    {
      path: '/home',
      name: 'Home',
      component: () => import('@/views/instructor/HomeView.vue'),
      meta: { requiresAuth: true, role: ['instructor'] },
    },
    {
      path: '/job-postings/:id',
      name: 'JobPostingDetail',
      component: () => import('@/views/instructor/JobPostingDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/applications',
      name: 'MyApplications',
      component: () => import('@/views/instructor/ApplicationsView.vue'),
      meta: { requiresAuth: true, role: ['instructor'] },
    },
    {
      path: '/favorites',
      name: 'Favorites',
      component: () => import('@/views/instructor/FavoritesView.vue'),
      meta: { requiresAuth: true, role: ['instructor'] },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/instructor/ProfileView.vue'),
      meta: { requiresAuth: true, role: ['instructor'] },
    },
    {
      path: '/profile/edit',
      name: 'ProfileEdit',
      component: () => import('@/views/instructor/ProfileEditView.vue'),
      meta: { requiresAuth: true, role: ['instructor'] },
    },
    {
      path: '/reviews/write/:applicationId',
      name: 'ReviewWrite',
      component: () => import('@/views/instructor/ReviewWriteView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reviews/edit/:id',
      name: 'ReviewEdit',
      component: () => import('@/views/instructor/ReviewWriteView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reviews/my',
      name: 'MyReviews',
      component: () => import('@/views/instructor/MyReviewsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reviews/:targetType/:targetId',
      name: 'ReviewList',
      component: () => import('@/views/instructor/ReviewListView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/verification',
      name: 'Verification',
      component: () => import('@/views/instructor/VerificationView.vue'),
      meta: { requiresAuth: true, role: ['instructor'] },
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import('@/views/instructor/NotificationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings/notifications',
      name: 'NotificationSettings',
      component: () => import('@/views/instructor/NotificationSettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('@/views/instructor/SearchView.vue'),
      meta: { requiresAuth: false, hideNav: true },
    },
    {
      path: '/academies/:id',
      name: 'AcademyProfile',
      component: () => import('@/views/instructor/AcademyProfileView.vue'),
      meta: { requiresAuth: false },
    },
    // 학원 회원
    {
      path: '/academy/postings',
      name: 'AcademyPostings',
      component: () => import('@/views/academy/PostingsView.vue'),
      meta: { requiresAuth: true, role: ['academy'] },
    },
    {
      path: '/academy/postings/new',
      name: 'AcademyPostingNew',
      component: () => import('@/views/academy/PostingEditView.vue'),
      meta: { requiresAuth: true, role: ['academy'] },
    },
    {
      path: '/academy/postings/:id/edit',
      name: 'AcademyPostingEdit',
      component: () => import('@/views/academy/PostingEditView.vue'),
      meta: { requiresAuth: true, role: ['academy'] },
    },
    {
      path: '/academy/applications',
      name: 'AcademyApplications',
      component: () => import('@/views/academy/ApplicationsView.vue'),
      meta: { requiresAuth: true, role: ['academy'] },
    },
    {
      path: '/academy/applications/:id',
      name: 'AcademyApplicationDetail',
      component: () => import('@/views/academy/ApplicationDetailView.vue'),
      meta: { requiresAuth: true, role: ['academy'] },
    },
    {
      path: '/academy/manage',
      name: 'AcademyManage',
      component: () => import('@/views/academy/AcademyManageView.vue'),
      meta: { requiresAuth: true, role: ['academy'] },
    },
    {
      path: '/academy/profile/edit',
      name: 'AcademyProfileEdit',
      component: () => import('@/views/academy/AcademyProfileEditView.vue'),
      meta: { requiresAuth: true, role: ['academy'] },
    },
    {
      path: '/academy/verification',
      name: 'AcademyVerification',
      component: () => import('@/views/academy/VerificationView.vue'),
      meta: { requiresAuth: true, role: ['academy'] },
    },
    {
      path: '/academy/reviews',
      name: 'AcademyReviews',
      component: () => import('@/views/academy/ReviewsView.vue'),
      meta: { requiresAuth: true, role: ['academy'] },
    },
    {
      path: '/academy/hired',
      name: 'AcademyHired',
      component: () => import('@/views/academy/HiredView.vue'),
      meta: { requiresAuth: true, role: ['academy'] },
    },
    // 공통 페이지
    {
      path: '/terms/service',
      name: 'TermsService',
      component: () => import('@/views/common/TermsView.vue'),
      meta: { requiresAuth: false, hideNav: true, termType: 'service' },
    },
    {
      path: '/terms/privacy',
      name: 'TermsPrivacy',
      component: () => import('@/views/common/TermsView.vue'),
      meta: { requiresAuth: false, hideNav: true, termType: 'privacy' },
    },
    {
      path: '/faq',
      name: 'FAQ',
      component: () => import('@/views/common/FAQView.vue'),
      meta: { requiresAuth: false, hideNav: true },
    },
    {
      path: '/support',
      name: 'Support',
      component: () => import('@/views/common/SupportView.vue'),
      meta: { requiresAuth: true, hideNav: true },
    },
    {
      path: '/settings/account',
      name: 'AccountSettings',
      component: () => import('@/views/common/AccountSettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/views/error/NotFoundView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

// 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 초기화 (토큰 확인)
  if (!authStore.user) {
    await authStore.init()
  }

  // 인증 필요 체크
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 역할 기반 접근 제어
  if (to.meta.role && authStore.user) {
    const userRole = authStore.user.role
    if (!to.meta.role.includes(userRole)) {
      // 권한 없음 - 홈으로 리다이렉트
      if (userRole === 'instructor') {
        next('/home')
      } else if (userRole === 'academy') {
        next('/academy/postings')
      } else {
        next('/')
      }
      return
    }
  }

  // 로그인된 상태에서 로그인 페이지 접근 시
  if (!to.meta.requiresAuth && authStore.isAuthenticated && to.name === 'Login') {
    const userRole = authStore.user?.role
    if (userRole === 'instructor') {
      next('/home')
    } else if (userRole === 'academy') {
      next('/academy/postings')
    } else {
      next('/')
    }
    return
  }

  next()
})

export default router