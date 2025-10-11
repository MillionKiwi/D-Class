<template>
  <div class="error-page">
    <div class="error-page__container">
      <div class="error-page__illustration">
        <ConstructionIcon :size="120" />
      </div>
      <h2 class="error-page__title">서비스 점검 중입니다</h2>
      <p class="error-page__description">
        더 나은 서비스 제공을 위해 시스템 점검을 진행하고 있습니다.<br />
        잠시 후 다시 이용해주세요.
      </p>

      <div class="maintenance-info">
        <div class="info-item">
          <ClockIcon :size="20" />
          <div>
            <p class="info-label">점검 시간</p>
            <p class="info-value">{{ maintenanceTime }}</p>
          </div>
        </div>
        <div class="info-item">
          <CalendarIcon :size="20" />
          <div>
            <p class="info-label">예상 종료</p>
            <p class="info-value">{{ expectedEnd }}</p>
          </div>
        </div>
      </div>

      <div class="contact-info">
        <p>문의사항이 있으시면 아래 연락처로 연락해주세요</p>
        <p class="contact-email">
          <MailIcon :size="16" />
          support@d-class.com
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Construction as ConstructionIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Mail as MailIcon,
} from 'lucide-vue-next'

// TODO: 실제 점검 시간 정보는 API에서 가져오기
const maintenanceTime = ref('2025.10.11 02:00 - 06:00')
const expectedEnd = ref('2025.10.11 06:00 (약 2시간 남음)')
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
    color: $color-info;
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
}

.maintenance-info {
  background-color: $color-white;
  border: 1px solid $color-divider;
  border-radius: $radius-lg;
  padding: $spacing-xl;
  margin-bottom: $spacing-2xl;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.info-item {
  display: flex;
  gap: $spacing-md;
  text-align: left;

  svg {
    color: $color-primary;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .info-label {
    font-size: $font-size-body-small;
    color: $color-text-secondary;
    margin: 0 0 $spacing-xs 0;
  }

  .info-value {
    font-size: $font-size-body;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
    margin: 0;
  }
}

.contact-info {
  p {
    font-size: $font-size-body-small;
    color: $color-text-secondary;
    margin: 0 0 $spacing-sm 0;
  }

  .contact-email {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    font-size: $font-size-body;
    font-weight: $font-weight-semibold;
    color: $color-primary;
    margin: 0;
  }
}
</style>

