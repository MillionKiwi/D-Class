<template>
  <div class="error-page">
    <div class="error-page__container">
      <div class="error-page__illustration">
        <AlertCircleIcon :size="120" />
      </div>
      <h1 class="error-page__code">500</h1>
      <h2 class="error-page__title">일시적인 오류가 발생했습니다</h2>
      <p class="error-page__description">
        서버에 일시적인 문제가 발생했습니다.<br />
        잠시 후 다시 시도해주세요.
      </p>
      <div class="error-page__actions">
        <BaseButton @click="handleRefresh">
          <RefreshCwIcon :size="20" />
          새로고침
        </BaseButton>
        <BaseButton variant="secondary" @click="goHome">홈으로 돌아가기</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { AlertCircle as AlertCircleIcon, RefreshCw as RefreshCwIcon } from 'lucide-vue-next'
import { BaseButton } from '@/components/common'
import { useAuthStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()

const handleRefresh = () => {
  window.location.reload()
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
    color: $color-error;
    margin-bottom: $spacing-xl;

    svg {
      width: 120px;
      height: 120px;
    }
  }

  &__code {
    font-size: 72px;
    font-weight: $font-weight-bold;
    color: $color-error;
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

