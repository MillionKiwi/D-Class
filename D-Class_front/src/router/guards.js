/**
 * 라우트 가드
 */

import { USER_ROLES, STORAGE_KEYS } from '@/utils/constants'

/**
 * 인증 여부 확인
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  return !!token
}

/**
 * 사용자 역할 가져오기
 */
export const getUserRole = () => {
  const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO)
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo)
      return user.role
    } catch (error) {
      console.error('Failed to parse user info:', error)
      return null
    }
  }
  return null
}

/**
 * 인증 필요 가드
 */
export const requireAuth = (to, from, next) => {
  if (!isAuthenticated()) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
}

/**
 * 역할 확인 가드
 */
export const requireRole = (allowedRoles) => {
  return (to, from, next) => {
    if (!isAuthenticated()) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }

    const userRole = getUserRole()
    if (allowedRoles.includes(userRole)) {
      next()
    } else {
      // 역할에 맞지 않으면 해당 역할의 홈으로 리다이렉트
      const redirectPaths = {
        [USER_ROLES.INSTRUCTOR]: '/instructor/jobs',
        [USER_ROLES.ACADEMY]: '/academy/jobs',
        [USER_ROLES.ADMIN]: '/admin/dashboard',
      }
      next(redirectPaths[userRole] || '/')
    }
  }
}

/**
 * 강사 전용 가드
 */
export const requireInstructor = requireRole([USER_ROLES.INSTRUCTOR])

/**
 * 학원 전용 가드
 */
export const requireAcademy = requireRole([USER_ROLES.ACADEMY])

/**
 * 관리자 전용 가드
 */
export const requireAdmin = requireRole([USER_ROLES.ADMIN])

/**
 * 게스트 전용 가드 (로그인 안된 사용자만)
 */
export const requireGuest = (to, from, next) => {
  if (isAuthenticated()) {
    const userRole = getUserRole()
    const redirectPaths = {
      [USER_ROLES.INSTRUCTOR]: '/instructor/jobs',
      [USER_ROLES.ACADEMY]: '/academy/jobs',
      [USER_ROLES.ADMIN]: '/admin/dashboard',
    }
    next(redirectPaths[userRole] || '/')
  } else {
    next()
  }
}

