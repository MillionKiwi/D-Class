<template>
  <div :class="['base-loading', { 'base-loading--fullscreen': fullscreen, 'base-loading--inline': inline }]">
    <div v-if="type === 'spinner'" class="base-loading__spinner"></div>
    <div v-else-if="type === 'skeleton'" class="base-loading__skeleton">
      <div class="skeleton-line" v-for="n in lines" :key="n"></div>
    </div>
    <p v-if="text" class="base-loading__text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'spinner',
    validator: (value) => ['spinner', 'skeleton'].includes(value),
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
  inline: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: '',
  },
  lines: {
    type: Number,
    default: 3,
  },
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.base-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;

  &--fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: $z-index-modal;
  }

  &--inline {
    padding: $spacing-xl;
  }

  &__spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba($color-primary, 0.2);
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__skeleton {
    width: 100%;
    max-width: 600px;

    .skeleton-line {
      height: 16px;
      background: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.06) 25%,
        rgba(0, 0, 0, 0.12) 50%,
        rgba(0, 0, 0, 0.06) 75%
      );
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s ease-in-out infinite;
      border-radius: $radius-sm;
      margin-bottom: $spacing-md;

      &:last-child {
        width: 60%;
      }
    }
  }

  &__text {
    color: $color-white;
    font-size: $font-size-body;
    margin: 0;

    .base-loading:not(.base-loading--fullscreen) & {
      color: $color-text-primary;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

