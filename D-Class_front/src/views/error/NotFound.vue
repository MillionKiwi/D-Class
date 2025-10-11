<template>
  <div class="error-page">
    <div class="error-page__container">
      <div class="error-page__illustration">
        <FileQuestionIcon :size="120" />
      </div>
      <h1 class="error-page__code">404</h1>
      <h2 class="error-page__title">페이지를 찾을 수 없습니다</h2>
      <p class="error-page__description">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <div class="error-page__actions">
        <BaseButton @click="goBack">이전 페이지</BaseButton>
        <BaseButton variant="secondary" @click="goHome">홈으로 돌아가기</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { FileQuestion as FileQuestionIcon } from 'lucide-vue-next'
import { BaseButton } from '@/components/common'
import { useAuthStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()

const goBack = () => {
  router.back()
}

const goHome = () => {
  if (authStore.isAuthenticated) {
    const redirectPath = authStore.getRedirectPath(authStore.userRole)
    router.push(redirectPath)
  } else {
    router.push('/login')
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.error-page {
  min-height: 100vh;
  @include flex-center;
  background-color: $color-background;
  padding: $spacing-lg;

  &__container {
    text-align: center;
    max-width: 500px;
  }

  &__illustration {
    color: $color-disabled;
    margin-bottom: $spacing-xl;

    svg {
      width: 120px;
      height: 120px;
    }
  }

  &__code {
    font-size: 72px;
    font-weight: $font-weight-bold;
    color: $color-primary;
    margin: 0 0 $spacing-md 0;
  }

  &__title {
    font-size: $font-size-h2;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
    margin: 0 0 $spacing-md 0;
  }

  &__description {
    font-size: $font-size-body;
    color: $color-text-secondary;
    line-height: $line-height-relaxed;
    margin: 0 0 $spacing-2xl 0;
  }

  &__actions {
    display: flex;
    gap: $spacing-md;
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>

