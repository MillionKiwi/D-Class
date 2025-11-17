<template>
  <nav class="bottom-nav">
    <router-link
      v-for="item in navItems"
      :key="item.name"
      :to="item.to"
      :class="['nav-item', { active: $route.name === item.name }]"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <component :is="'path'" :d="item.iconPath"></component>
      </svg>
      <span>{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const instructorNavItems = [
  {
    name: 'Home',
    to: '/home',
    label: '홈',
    iconPath:
      'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  },
  {
    name: 'MyApplications',
    to: '/applications',
    label: '지원 현황',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z',
  },
  {
    name: 'Favorites',
    to: '/favorites',
    label: '찜한 공고',
    iconPath:
      'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  },
  {
    name: 'Profile',
    to: '/profile',
    label: '마이페이지',
    iconPath:
      'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  },
]

const academyNavItems = [
  {
    name: 'AcademyPostings',
    to: '/academy/postings',
    label: '공고 관리',
    iconPath:
      'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z',
  },
  {
    name: 'AcademyApplications',
    to: '/academy/applications',
    label: '지원자 관리',
    iconPath:
      'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  },
  {
    name: 'AcademyReviews',
    to: '/academy/reviews',
    label: '리뷰 관리',
    iconPath:
      'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
  {
    name: 'AcademyManage',
    to: '/academy/manage',
    label: '학원 관리',
    iconPath:
      'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  },
]

const navItems = computed(() => {
  const userRole = authStore.user?.role
  if (userRole === 'academy') {
    return academyNavItems
  }
  return instructorNavItems
})
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--color-card);
  border-top: 1px solid var(--color-divider);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--spacing-xs) 0;
  z-index: 100;
  height: 64px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 12px;
  transition: color 0.2s;
  flex: 1;
}

.nav-item svg {
  stroke-width: 2;
}

.nav-item.active {
  color: var(--color-primary);
}

.nav-item.active svg {
  stroke-width: 2.5;
}

.nav-item span {
  font-size: 11px;
  font-weight: 500;
}
</style>
