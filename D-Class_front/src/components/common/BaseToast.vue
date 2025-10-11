<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="base-toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['base-toast', `base-toast--${toast.type}`]"
      >
        <span class="base-toast__message">{{ toast.message }}</span>
        <button class="base-toast__close" @click="removeToast(toast.id)">×</button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, remove: removeToast } = useToast()
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.base-toast-container {
  position: fixed;
  bottom: calc($nav-height + $spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  z-index: $z-index-toast;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  pointer-events: none;
  max-width: 90vw;

  @include mobile {
    bottom: calc($nav-height + $spacing-md);
  }
}

.base-toast {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md $spacing-lg;
  background-color: rgba(0, 0, 0, 0.8);
  color: $color-white;
  border-radius: $radius-md;
  box-shadow: $shadow-modal;
  pointer-events: auto;
  min-width: 300px;
  max-width: 500px;

  @include mobile {
    min-width: 280px;
  }

  &--success {
    background-color: rgba($color-success, 0.95);
    color: $color-white;
  }

  &--error {
    background-color: rgba($color-error, 0.95);
    color: $color-white;
  }

  &--warning {
    background-color: rgba($color-warning, 0.95);
    color: $color-text-primary;
  }

  &--info {
    background-color: rgba($color-info, 0.95);
    color: $color-text-primary;
  }

  &__message {
    flex: 1;
    font-size: $font-size-body-small;
    line-height: $line-height-normal;
  }

  &__close {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    color: inherit;
    font-size: 24px;
    cursor: pointer;
    border-radius: $radius-sm;
    transition: background-color $transition-fast;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}

// 토스트 애니메이션
.toast-enter-active {
  animation: toast-slide-up 0.2s ease-out;
}

.toast-leave-active {
  animation: toast-fade-out 0.2s ease-out;
}

@keyframes toast-slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes toast-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>

