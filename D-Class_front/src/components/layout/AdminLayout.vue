<template>
  <div class="admin-layout">
    <SideNavigation :pending-verifications="pendingVerifications" />

    <div class="admin-layout__content">
      <header class="admin-layout__header">
        <h1 v-if="pageTitle" class="admin-layout__title">{{ pageTitle }}</h1>
        <div class="admin-layout__actions">
          <slot name="header-actions" />
        </div>
      </header>

      <main class="admin-layout__main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import SideNavigation from './SideNavigation.vue'

// TODO: 실제 대기중인 인증 개수는 store에서 가져오기
const pendingVerifications = ref(12)

const route = useRoute()

// 페이지 제목 자동 생성
const pageTitle = computed(() => {
  const titles = {
    '/admin/dashboard': '대시보드',
    '/admin/members': '회원 관리',
    '/admin/verifications': '인증 관리',
    '/admin/jobs': '공고 관리',
    '/admin/reviews': '리뷰 관리',
    '/admin/inquiries': '문의/신고 관리',
  }
  return titles[route.path] || ''
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.admin-layout {
  min-height: 100vh;
  display: flex;
  background-color: $color-background;

  &__content {
    flex: 1;
    margin-left: 260px;
    display: flex;
    flex-direction: column;

    @include mobile {
      margin-left: 0;
    }

    @include tablet {
      margin-left: 0;
    }
  }

  &__header {
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;
    padding: $spacing-xl $spacing-2xl;
    @include flex-between;

    @include mobile {
      padding: $spacing-lg;
    }
  }

  &__title {
    font-size: $font-size-h1;
    font-weight: $font-weight-bold;
    margin: 0;
    color: $color-text-primary;
  }

  &__actions {
    display: flex;
    gap: $spacing-md;
    align-items: center;
  }

  &__main {
    flex: 1;
    padding: $spacing-2xl;
    overflow-x: hidden;

    @include mobile {
      padding: $spacing-lg;
    }
  }
}
</style>

