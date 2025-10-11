<template>
  <span
    :class="[
      'base-badge',
      `base-badge--${variant}`,
      {
        'base-badge--dot': dot,
        'base-badge--small': size === 'small',
      },
    ]"
  >
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) =>
      ['default', 'primary', 'success', 'warning', 'error', 'info'].includes(value),
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium'].includes(value),
  },
  dot: {
    type: Boolean,
    default: false,
  },
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.base-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xs $spacing-sm;
  font-size: $font-size-caption;
  font-weight: $font-weight-medium;
  border-radius: $radius-md;
  white-space: nowrap;

  // 기본 스타일
  &--default {
    background-color: $color-disabled;
    color: $color-text-primary;
  }

  &--primary {
    background-color: $color-primary;
    color: $color-white;
  }

  // 성공 (인증 완료)
  &--success {
    background-color: $color-success;
    color: $color-white;
  }

  // 주의 (대기)
  &--warning {
    background-color: $color-warning;
    color: $color-text-primary;
  }

  // 에러 (반려)
  &--error {
    background-color: $color-error;
    color: $color-white;
  }

  // 정보
  &--info {
    background-color: $color-info;
    color: $color-text-primary;
  }

  // 작은 크기
  &--small {
    padding: 2px $spacing-xs;
    font-size: 10px;
  }

  // Dot 스타일 (개수 배지용)
  &--dot {
    min-width: 20px;
    height: 20px;
    padding: 0;
    border-radius: $radius-full;
  }
}
</style>

