<template>
  <button
    :type="type"
    :class="[
      'base-button',
      `base-button--${variant}`,
      {
        'base-button--disabled': disabled,
        'base-button--loading': loading,
        'base-button--block': block,
      },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="base-button__spinner"></span>
    <span v-else class="base-button__content">
      <slot />
    </span>
  </button>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'text', 'danger'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: $button-height;
  padding: 0 $button-padding-x;
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  border-radius: $radius-md;
  border: none;
  cursor: pointer;
  transition: all $transition-fast;
  white-space: nowrap;
  user-select: none;

  &:focus-visible {
    @include focus-ring;
  }

  // Primary Button (Soft Coral)
  &--primary {
    background-color: $color-accent;
    color: $color-white;

    &:hover:not(.base-button--disabled):not(.base-button--loading) {
      background-color: $color-accent-dark;
      transform: scale(1.02);
    }

    &:active:not(.base-button--disabled):not(.base-button--loading) {
      transform: scale(0.98);
    }
  }

  // Secondary Button
  &--secondary {
    background-color: $color-white;
    color: $color-primary;
    border: 2px solid $color-primary;

    &:hover:not(.base-button--disabled):not(.base-button--loading) {
      background-color: rgba($color-primary, 0.05);
      transform: scale(1.02);
    }

    &:active:not(.base-button--disabled):not(.base-button--loading) {
      transform: scale(0.98);
    }
  }

  // Text Button
  &--text {
    background-color: transparent;
    color: $color-primary;
    height: auto;
    padding: $spacing-sm;

    &:hover:not(.base-button--disabled):not(.base-button--loading) {
      color: $color-primary-dark;
      background-color: rgba($color-primary, 0.05);
    }
  }

  // Danger Button (에러/삭제용)
  &--danger {
    background-color: $color-error;
    color: $color-white;

    &:hover:not(.base-button--disabled):not(.base-button--loading) {
      background-color: darken($color-error, 10%);
      transform: scale(1.02);
    }

    &:active:not(.base-button--disabled):not(.base-button--loading) {
      transform: scale(0.98);
    }
  }

  // Disabled State
  &--disabled {
    @include button-disabled;
  }

  // Loading State
  &--loading {
    cursor: wait;
    opacity: 0.7;
  }

  // Block (Full width)
  &--block {
    width: 100%;
  }

  &__spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: $color-white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__content {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

