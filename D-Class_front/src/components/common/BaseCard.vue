<template>
  <div
    :class="[
      'base-card',
      {
        'base-card--clickable': clickable,
        'base-card--selected': selected,
      },
    ]"
    @click="handleClick"
  >
    <slot />
  </div>
</template>

<script setup>
const props = defineProps({
  clickable: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.base-card {
  @include card-style;
  transition: all $transition-fast;

  &--clickable {
    cursor: pointer;

    &:hover {
      box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &--selected {
    border: 2px solid $color-primary;
    background-color: rgba($color-primary, 0.02);
  }
}
</style>

