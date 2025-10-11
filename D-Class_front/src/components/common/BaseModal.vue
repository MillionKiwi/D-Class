<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="base-modal" @click.self="handleBackdropClick">
        <div :class="['base-modal__container', `base-modal__container--${size}`]">
          <!-- 헤더 -->
          <div v-if="showHeader" class="base-modal__header">
            <h2 class="base-modal__title">{{ title }}</h2>
            <button v-if="closable" class="base-modal__close" @click="close" aria-label="닫기">
              ×
            </button>
          </div>

          <!-- 본문 -->
          <div class="base-modal__body">
            <slot />
          </div>

          <!-- 푸터 (액션 버튼) -->
          <div v-if="showFooter" class="base-modal__footer">
            <slot name="footer">
              <BaseButton v-if="showCancel" variant="secondary" @click="handleCancel">
                {{ cancelText }}
              </BaseButton>
              <BaseButton variant="primary" @click="handleConfirm">
                {{ confirmText }}
              </BaseButton>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  closable: {
    type: Boolean,
    default: true,
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  cancelText: {
    type: String,
    default: '취소',
  },
  confirmText: {
    type: String,
    default: '확인',
  },
})

const emit = defineEmits(['update:isOpen', 'close', 'confirm', 'cancel'])

const close = () => {
  emit('update:isOpen', false)
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop && props.closable) {
    close()
  }
}

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  close()
}

// Body 스크롤 제어
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.base-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  @include flex-center;
  z-index: $z-index-modal;
  padding: $spacing-lg;

  &__container {
    background-color: $color-white;
    border-radius: $radius-xl;
    box-shadow: $shadow-modal;
    max-height: 90vh;
    overflow: auto;
    @include custom-scrollbar;
    width: 100%;

    &--small {
      max-width: 400px;
    }

    &--medium {
      max-width: 600px;
    }

    &--large {
      max-width: 800px;
    }
  }

  &__header {
    @include flex-between;
    padding: $spacing-xl;
    border-bottom: 1px solid $color-divider;
  }

  &__title {
    font-size: $font-size-h2;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
    margin: 0;
  }

  &__close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    font-size: 32px;
    color: $color-text-secondary;
    cursor: pointer;
    border-radius: $radius-sm;
    transition: all $transition-fast;

    &:hover {
      background-color: $color-background;
      color: $color-text-primary;
    }
  }

  &__body {
    padding: $spacing-xl;
  }

  &__footer {
    display: flex;
    gap: $spacing-md;
    justify-content: flex-end;
    padding: $spacing-xl;
    border-top: 1px solid $color-divider;
  }
}

// 모달 애니메이션
.modal-enter-active {
  animation: modal-fade-in 0.25s ease-out;
}

.modal-leave-active {
  animation: modal-fade-out 0.25s ease-out;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

// 모바일 대응
@include mobile {
  .base-modal {
    padding: 0;

    &__container {
      max-height: 100vh;
      border-radius: 0;
      height: 100%;
    }
  }
}
</style>

