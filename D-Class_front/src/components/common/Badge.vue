<template>
  <span :class="['badge', `badge-${variant}`, { 'badge-small': small }]">
    <slot></slot>
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'warning', 'error', 'info', 'disabled'].includes(value),
  },
  small: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.badge-small {
  font-size: 10px;
  padding: 2px 6px;
}
</style>
