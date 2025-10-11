<template>
  <div class="base-image-upload">
    <!-- 라벨 -->
    <label v-if="label" class="upload-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <!-- 업로드 영역 -->
    <div
      :class="['upload-area', { 'has-image': previewUrl, error: !!error, disabled }]"
      @click="handleClick"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <!-- 미리보기 이미지 -->
      <div v-if="previewUrl" class="preview-container">
        <img :src="previewUrl" :alt="label || '미리보기'" class="preview-image" />
        <div class="preview-overlay">
          <button
            v-if="!disabled"
            type="button"
            class="preview-action"
            @click.stop="handleRemove"
          >
            <XIcon :size="20" />
            <span>삭제</span>
          </button>
          <button
            v-if="!disabled"
            type="button"
            class="preview-action"
            @click.stop="handleClick"
          >
            <RefreshCwIcon :size="20" />
            <span>변경</span>
          </button>
        </div>
      </div>

      <!-- 업로드 프롬프트 -->
      <div v-else class="upload-prompt">
        <div class="upload-icon">
          <ImageIcon v-if="accept.includes('image')" :size="32" />
          <FileIcon v-else :size="32" />
        </div>
        <p class="upload-text">
          {{ placeholder || '파일을 선택하거나 드래그하여 업로드' }}
        </p>
        <p v-if="maxSizeMB" class="upload-hint">
          최대 {{ maxSizeMB }}MB까지 업로드 가능
        </p>
      </div>

      <!-- Hidden File Input -->
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :disabled="disabled"
        @change="handleFileSelect"
        style="display: none"
      />
    </div>

    <!-- 에러 메시지 -->
    <p v-if="error" class="error-message">
      <AlertCircleIcon :size="16" />
      {{ error }}
    </p>

    <!-- 도움말 -->
    <p v-if="hint && !error" class="hint-message">{{ hint }}</p>

    <!-- 업로드 진행 -->
    <div v-if="isUploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
      </div>
      <p class="progress-text">{{ uploadProgress }}%</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  Image as ImageIcon,
  File as FileIcon,
  X as XIcon,
  RefreshCw as RefreshCwIcon,
  AlertCircle as AlertCircleIcon,
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: [File, String, null],
    default: null,
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  accept: {
    type: String,
    default: 'image/*',
  },
  maxSizeMB: {
    type: Number,
    default: 5,
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
})

const emit = defineEmits(['update:modelValue', 'change', 'error'])

const fileInput = ref(null)
const previewUrl = ref('')
const isUploading = ref(false)
const uploadProgress = ref(0)

// 파일 또는 URL에서 미리보기 생성
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      previewUrl.value = ''
      return
    }

    if (typeof newValue === 'string') {
      // URL인 경우
      previewUrl.value = newValue
    } else if (newValue instanceof File) {
      // File 객체인 경우
      const reader = new FileReader()
      reader.onload = (e) => {
        previewUrl.value = e.target.result
      }
      reader.readAsDataURL(newValue)
    }
  },
  { immediate: true }
)

const handleClick = () => {
  if (!props.disabled) {
    fileInput.value?.click()
  }
}

const validateFile = (file) => {
  // 파일 크기 검증
  const maxSizeBytes = props.maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return `파일 크기는 ${props.maxSizeMB}MB를 초과할 수 없습니다.`
  }

  // 파일 타입 검증
  const acceptedTypes = props.accept.split(',').map((type) => type.trim())
  const isAccepted = acceptedTypes.some((type) => {
    if (type === 'image/*') return file.type.startsWith('image/')
    if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', ''))
    return file.type === type
  })

  if (!isAccepted) {
    return '지원하지 않는 파일 형식입니다.'
  }

  return null
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const error = validateFile(file)
  if (error) {
    emit('error', error)
    return
  }

  emit('update:modelValue', file)
  emit('change', file)

  // 진행률 시뮬레이션 (실제 업로드 시에는 axios의 onUploadProgress 사용)
  simulateUpload()
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDragLeave = (event) => {
  event.preventDefault()
}

const handleDrop = (event) => {
  event.preventDefault()
  if (props.disabled) return

  const file = event.dataTransfer?.files?.[0]
  if (!file) return

  const error = validateFile(file)
  if (error) {
    emit('error', error)
    return
  }

  emit('update:modelValue', file)
  emit('change', file)
  simulateUpload()
}

const handleRemove = () => {
  emit('update:modelValue', null)
  emit('change', null)
  previewUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const simulateUpload = () => {
  isUploading.value = true
  uploadProgress.value = 0

  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        isUploading.value = false
        uploadProgress.value = 0
      }, 300)
    }
  }, 100)
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.base-image-upload {
  width: 100%;
}

.upload-label {
  display: block;
  font-size: $font-size-body;
  font-weight: $font-weight-medium;
  color: $color-text-primary;
  margin-bottom: $spacing-sm;

  .required {
    color: $color-error;
    margin-left: $spacing-xs;
  }
}

.upload-area {
  position: relative;
  width: 100%;
  min-height: 200px;
  border: 2px dashed $color-divider;
  border-radius: $radius-lg;
  background-color: $color-background;
  cursor: pointer;
  transition: all $transition-base;
  overflow: hidden;

  &:hover:not(.disabled) {
    border-color: $color-primary;
    background-color: rgba($color-primary, 0.05);
  }

  &.has-image {
    border-style: solid;
    min-height: 300px;
  }

  &.error {
    border-color: $color-error;
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    @include flex-center;
    gap: $spacing-md;
    opacity: 0;
    transition: opacity $transition-base;
  }

  &:hover .preview-overlay {
    opacity: 1;
  }

  .preview-action {
    @include flex-center;
    flex-direction: column;
    gap: $spacing-xs;
    padding: $spacing-md;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: $radius-md;
    border: none;
    color: $color-text-primary;
    font-size: $font-size-body-small;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background-color: $color-white;
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

.upload-prompt {
  @include flex-center;
  flex-direction: column;
  gap: $spacing-md;
  padding: $spacing-2xl;
  height: 100%;
  min-height: 200px;

  .upload-icon {
    color: $color-text-secondary;
  }

  .upload-text {
    font-size: $font-size-body;
    color: $color-text-primary;
    font-weight: $font-weight-medium;
    margin: 0;
    text-align: center;
  }

  .upload-hint {
    font-size: $font-size-body-small;
    color: $color-text-secondary;
    margin: 0;
    text-align: center;
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-body-small;
  color: $color-error;
  margin-top: $spacing-sm;
}

.hint-message {
  font-size: $font-size-body-small;
  color: $color-text-secondary;
  margin-top: $spacing-sm;
}

.upload-progress {
  margin-top: $spacing-md;

  .progress-bar {
    width: 100%;
    height: 8px;
    background-color: $color-divider;
    border-radius: $radius-full;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background-color: $color-primary;
      transition: width $transition-base;
    }
  }

  .progress-text {
    font-size: $font-size-caption;
    color: $color-text-secondary;
    text-align: center;
    margin-top: $spacing-xs;
  }
}
</style>

