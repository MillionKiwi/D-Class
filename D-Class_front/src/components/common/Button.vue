<template>
  <button
    :class="['btn', `btn-${variant}`, { 'btn-full': fullWidth, 'btn-loading': loading }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loading-spinner" style="margin-right: 8px"></span>
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'text', 'error'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])
</script>

<style scoped>
.btn-full {
  width: 100%;
}
</style>
