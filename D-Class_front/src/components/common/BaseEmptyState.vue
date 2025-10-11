<template>
  <div class="base-empty-state">
    <div class="base-empty-state__icon">
      <slot name="icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </slot>
    </div>

    <h3 v-if="title" class="base-empty-state__title">{{ title }}</h3>
    <p v-if="description" class="base-empty-state__description">{{ description }}</p>

    <div v-if="$slots.action" class="base-empty-state__action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.base-empty-state {
  @include flex-center;
  flex-direction: column;
  padding: $spacing-3xl $spacing-lg;
  text-align: center;

  &__icon {
    color: $color-disabled;
    margin-bottom: $spacing-lg;

    svg {
      width: 64px;
      height: 64px;
    }
  }

  &__title {
    font-size: $font-size-h3;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
    margin: 0 0 $spacing-sm 0;
  }

  &__description {
    font-size: $font-size-body;
    color: $color-text-secondary;
    margin: 0 0 $spacing-xl 0;
    max-width: 400px;
  }

  &__action {
    margin-top: $spacing-lg;
  }
}
</style>

