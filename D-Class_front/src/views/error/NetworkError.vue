<template>
  <div class="error-page">
    <div class="error-page__container">
      <div class="error-page__illustration">
        <WifiOffIcon :size="120" />
      </div>
      <h2 class="error-page__title">인터넷 연결을 확인해주세요</h2>
      <p class="error-page__description">
        네트워크 연결이 불안정하거나 끊어진 것 같습니다.<br />
        인터넷 연결을 확인하고 다시 시도해주세요.
      </p>
      <div class="error-page__actions">
        <BaseButton @click="handleRetry">
          <RefreshCwIcon :size="20" />
          다시 시도
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { WifiOff as WifiOffIcon, RefreshCw as RefreshCwIcon } from 'lucide-vue-next'
import { BaseButton } from '@/components/common'

const router = useRouter()

const handleRetry = () => {
  window.location.reload()
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
    color: $color-warning;
    margin-bottom: $spacing-xl;

    svg {
      width: 120px;
      height: 120px;
    }
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

