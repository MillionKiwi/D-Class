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