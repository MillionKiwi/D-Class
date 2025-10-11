<template>
  <div class="base-input">
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>

    <div class="base-input__wrapper">
      <input
        v-if="!textarea"
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :class="[
          'base-input__field',
          {
            'base-input__field--error': error,
            'base-input__field--success': success,
            'base-input__field--disabled': disabled,
          },
        ]"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <textarea
        v-else
        :id="inputId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :rows="rows"
        :class="[
          'base-input__field',
          'base-input__field--textarea',
          {
            'base-input__field--error': error,
            'base-input__field--success': success,
            'base-input__field--disabled': disabled,
          },
        ]"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <!-- 글자 수 카운터 -->
      <div v-if="showCounter && maxlength" class="base-input__counter">
        {{ modelValue?.length || 0 }}/{{ maxlength }}
      </div>
    </div>

    <!-- 에러 메시지 -->
    <p v-if="error && errorMessage" class="base-input__message base-input__message--error">
      {{ errorMessage }}
    </p>

    <!-- 성공 메시지 -->
    <p v-if="success && successMessage" class="base-input__message base-input__message--success">
      {{ successMessage }}
    </p>

    <!-- 도움말 -->
    <p v-if="hint && !error && !success" class="base-input__hint">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
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
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  success: {
    type: Boolean,
    default: false,
  },
  successMessage: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  maxlength: {
    type: Number,
    default: null,
  },
  showCounter: {
    type: Boolean,
    default: false,
  },
  textarea: {
    type: Boolean,
    default: false,
  },
  rows: {
    type: Number,
    default: 4,
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputId = computed(() => {
  return `input-${Math.random().toString(36).substr(2, 9)}`
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.base-input {
  width: 100%;

  &__label {
    display: block;
    font-size: $font-size-body;
    font-weight: $font-weight-medium;
    color: $color-text-primary;
    margin-bottom: $spacing-sm;
  }

  &__required {
    color: $color-error;
    margin-left: $spacing-xs;
  }

  &__wrapper {
    position: relative;
  }

  &__field {
    width: 100%;
    height: $input-height;
    padding: 0 $input-padding-x;
    font-size: $font-size-body;
    font-family: inherit;
    color: $color-text-primary;
    background-color: $color-white;
    border: $input-border-width solid $color-divider;
    border-radius: $radius-md;
    outline: none;
    transition: all $transition-fast;

    &::placeholder {
      color: $color-text-secondary;
    }

    &:focus {
      border-color: $color-primary;
      border-width: $input-focus-border-width;
    }

    // Textarea
    &--textarea {
      height: auto;
      padding: $spacing-md $input-padding-x;
      resize: vertical;
      min-height: 100px;
    }

    // Error State
    &--error {
      border-color: $color-error;

      &:focus {
        border-color: $color-error;
      }
    }

    // Success State
    &--success {
      border-color: $color-success;

      &:focus {
        border-color: $color-success;
      }
    }

    // Disabled State
    &--disabled {
      background-color: $color-background;
      color: $color-text-secondary;
      cursor: not-allowed;

      &::placeholder {
        color: $color-disabled;
      }
    }
  }

  &__counter {
    position: absolute;
    bottom: $spacing-sm;
    right: $spacing-md;
    font-size: $font-size-caption;
    color: $color-text-secondary;
  }

  &__message {
    margin-top: $spacing-sm;
    font-size: $font-size-body-small;

    &--error {
      color: $color-error;
    }

    &--success {
      color: $color-success;
    }
  }

  &__hint {
    margin-top: $spacing-sm;
    font-size: $font-size-body-small;
    color: $color-text-secondary;
  }
}
</style>

