<template>
  <InstructorLayout>
    <div class="verification-upload">
      <!-- 헤더 -->
      <div class="verification-upload__header">
        <button class="back-button" @click="$router.back()">
          <ArrowLeftIcon :size="24" />
        </button>
        <h1>학력/경력 인증</h1>
      </div>

      <!-- 현재 인증 상태 -->
      <section class="verification-upload__section">
        <div :class="['status-card', `status-card--${verificationStatus}`]">
          <div class="status-card__icon">
            <component :is="statusIcon" :size="48" />
          </div>
          <div class="status-card__content">
            <h3>{{ statusTitle }}</h3>
            <p>{{ statusDescription }}</p>
            <p v-if="rejectionReason" class="rejection-reason">
              <strong>반려 사유:</strong> {{ rejectionReason }}
            </p>
          </div>
        </div>
      </section>

      <!-- 서류 업로드 안내 -->
      <section class="verification-upload__section">
        <h3 class="section-title">서류 업로드</h3>
        <div class="upload-guide">
          <p>졸업증명서, 경력증명서 등을 업로드해주세요</p>
          <ul>
            <li>허용 파일: JPG, PNG, PDF</li>
            <li>최대 용량: 10MB</li>
          </ul>
        </div>

        <!-- 파일 드롭존 -->
        <div
          class="file-dropzone"
          :class="{ dragging: isDragging }"
          @click="fileInput?.click()"
          @drop.prevent="handleDrop"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
        >
          <UploadIcon :size="48" />
          <p class="dropzone-text">클릭하거나 파일을 드래그하세요</p>
        </div>

        <input
          ref="fileInput"
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf"
          style="display: none"
          @change="handleFileSelect"
        />

        <!-- 첨부된 파일 목록 -->
        <div v-if="uploadedFiles.length > 0" class="file-list">
          <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
            <div class="file-item__icon">
              <FileTextIcon :size="20" />
            </div>
            <div class="file-item__info">
              <p class="file-name">{{ file.name }}</p>
              <p class="file-size">{{ formatFileSize(file.size) }}</p>
            </div>
            <button class="file-item__delete" @click="removeFile(index)">
              <XIcon :size="20" />
            </button>
          </div>
        </div>
      </section>

      <!-- 하단 버튼 -->
      <div class="verification-upload__actions">
        <BaseButton
          v-if="canSubmit"
          block
          :disabled="uploadedFiles.length === 0"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          {{ verificationStatus === 'rejected' ? '재신청하기' : '인증 신청하기' }}
        </BaseButton>
      </div>
    </div>
  </InstructorLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft as ArrowLeftIcon,
  Upload as UploadIcon,
  FileText as FileTextIcon,
  X as XIcon,
  ShieldCheck as ShieldCheckIcon,
  Clock as ClockIcon,
  ShieldX as ShieldXIcon,
  Shield as ShieldIcon,
} from 'lucide-vue-next'
import { InstructorLayout } from '@/components/layout'
import { BaseButton, BaseInput } from '@/components/common'
import { useProfileStore } from '@/stores'
import { FILE_UPLOAD } from '@/utils/constants'
import { formatFileSize } from '@/utils/helpers'
import { validateFileSize, validateFileType } from '@/utils/validators'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const profileStore = useProfileStore()
const { error: showError } = useToast()

const fileInput = ref(null)
const uploadedFiles = ref([])
const isDragging = ref(false)
const isSubmitting = ref(false)
const verificationStatus = ref('unverified') // unverified, pending, verified, rejected
const rejectionReason = ref('')

// Status 정보
const statusInfo = computed(() => {
  const info = {
    unverified: {
      icon: ShieldIcon,
      title: '미인증 상태',
      description: '서류를 제출하여 신뢰도를 높이세요',
    },
    pending: {
      icon: ClockIcon,
      title: '인증 대기 중',
      description: '관리자가 검토 중입니다. 1-2일 소요됩니다.',
    },
    verified: {
      icon: ShieldCheckIcon,
      title: '인증 완료',
      description: '학력/경력 인증이 완료되었습니다.',
    },
    rejected: {
      icon: ShieldXIcon,
      title: '인증 반려',
      description: '제출하신 서류가 반려되었습니다. 재신청이 가능합니다.',
    },
  }
  return info[verificationStatus.value]
})

const statusIcon = computed(() => statusInfo.value.icon)
const statusTitle = computed(() => statusInfo.value.title)
const statusDescription = computed(() => statusInfo.value.description)

const canSubmit = computed(() => {
  return verificationStatus.value === 'unverified' || verificationStatus.value === 'rejected'
})

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
}

const handleDrop = (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

const addFiles = (files) => {
  files.forEach((file) => {
    // 파일 크기 검증
    if (!validateFileSize(file, FILE_UPLOAD.MAX_SIZE)) {
      showError(`${file.name}: 파일 크기는 10MB 이하만 가능합니다`)
      return
    }

    // 파일 타입 검증
    if (!validateFileType(file, FILE_UPLOAD.ALLOWED_TYPES)) {
      showError(`${file.name}: JPG, PNG, PDF 파일만 업로드 가능합니다`)
      return
    }

    uploadedFiles.value.push(file)
  })
}

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

const handleSubmit = async () => {
  if (uploadedFiles.value.length === 0) {
    showError('최소 1개 이상의 파일을 업로드해주세요')
    return
  }

  isSubmitting.value = true
  const result = await profileStore.submitVerification(uploadedFiles.value)
  isSubmitting.value = false

  if (result.success) {
    verificationStatus.value = 'pending'
    uploadedFiles.value = []
  }
}

onMounted(async () => {
  const result = await profileStore.fetchVerificationStatus()
  if (result.success) {
    verificationStatus.value = result.data.status
    rejectionReason.value = result.data.rejectionReason || ''
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.verification-upload {
  &__header {
    @include flex-between;
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;

    .back-button {
      @include touch-target;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: $color-text-primary;
      cursor: pointer;
    }

    h1 {
      flex: 1;
      text-align: center;
      font-size: $font-size-h3;
      margin: 0;
    }
  }

  &__section {
    padding: $spacing-xl;
    background-color: $color-white;
    margin-bottom: $spacing-md;
  }

  &__actions {
    padding: $spacing-lg;
  }
}

.status-card {
  @include card-style;
  display: flex;
  gap: $spacing-lg;
  align-items: center;

  &__icon {
    @include flex-center;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;

    h3 {
      font-size: $font-size-h3;
      margin: 0 0 $spacing-xs 0;
    }

    p {
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      margin: 0;
    }

    .rejection-reason {
      margin-top: $spacing-sm;
      padding: $spacing-sm;
      background-color: rgba($color-error, 0.1);
      border-radius: $radius-sm;
      color: $color-error;

      strong {
        font-weight: $font-weight-semibold;
      }
    }
  }

  &--unverified {
    .status-card__icon {
      background-color: rgba($color-disabled, 0.2);
      color: $color-disabled;
    }
  }

  &--pending {
    .status-card__icon {
      background-color: rgba($color-warning, 0.2);
      color: darken($color-warning, 20%);
    }
  }

  &--verified {
    .status-card__icon {
      background-color: rgba($color-success, 0.2);
      color: darken($color-success, 20%);
    }
  }

  &--rejected {
    .status-card__icon {
      background-color: rgba($color-error, 0.2);
      color: darken($color-error, 20%);
    }
  }
}

.section-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  margin: 0 0 $spacing-md 0;
}

.upload-guide {
  margin-bottom: $spacing-lg;

  p {
    font-size: $font-size-body;
    color: $color-text-primary;
    margin: 0 0 $spacing-sm 0;
  }

  ul {
    list-style: disc;
    padding-left: $spacing-xl;
    margin: 0;

    li {
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      margin-bottom: $spacing-xs;
    }
  }
}

.file-dropzone {
  border: 2px dashed $color-divider;
  border-radius: $radius-lg;
  padding: $spacing-3xl;
  text-align: center;
  cursor: pointer;
  transition: all $transition-fast;
  background-color: $color-background;

  &:hover,
  &.dragging {
    border-color: $color-primary;
    background-color: rgba($color-primary, 0.05);
  }

  svg {
    color: $color-text-secondary;
    margin: 0 auto $spacing-md;
  }

  .dropzone-text {
    font-size: $font-size-body;
    color: $color-text-secondary;
    margin: 0;
  }
}

.file-list {
  margin-top: $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.file-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background-color: $color-background;
  border-radius: $radius-md;

  &__icon {
    @include flex-center;
    width: 40px;
    height: 40px;
    background-color: $color-white;
    border-radius: $radius-sm;
    color: $color-primary;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;

    .file-name {
      font-size: $font-size-body-small;
      font-weight: $font-weight-medium;
      color: $color-text-primary;
      margin: 0 0 $spacing-xs 0;
      @include text-ellipsis(1);
    }

    .file-size {
      font-size: $font-size-caption;
      color: $color-text-secondary;
      margin: 0;
    }
  }

  &__delete {
    @include touch-target;
    @include flex-center;
    background: none;
    border: none;
    color: $color-text-secondary;
    cursor: pointer;
    border-radius: $radius-sm;
    transition: all $transition-fast;
    flex-shrink: 0;

    &:hover {
      background-color: $color-error;
      color: $color-white;
    }
  }
}
</style>

