<template>
  <div class="input-wrapper">
    <label v-if="label" class="input-label">
      {{ label }}
      <span v-if="required" class="required-star">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['input-field', { error: error }]"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
    />
    <span v-if="error" class="error-message">{{ error }}</span>
    <span v-else-if="hint" class="hint-message">{{ hint }}</span>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue', 'blur'])
</script>

<style scoped>
.input-wrapper {
  margin-bottom: var(--spacing-lg);
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.required-star {
  color: var(--color-error);
  margin-left: 2px;
}

.error-message {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: 12px;
  color: var(--color-error);
}

.hint-message {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>
