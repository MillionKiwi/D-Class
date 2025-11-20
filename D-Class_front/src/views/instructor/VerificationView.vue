<template>
  <AppLayout>
    <div class="verification-page page-container">
      <div class="page-header">
        <h1 class="page-title">학력/경력 인증</h1>
      </div>

      <div v-if="loading && !verification" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else class="verification-content">
        <!-- 현재 인증 상태 -->
        <div class="status-card card">
          <h3>인증 상태</h3>
          <Badge :variant="getStatusBadgeVariant(verification?.status || 'none')" large>
            {{ getStatusLabel(verification?.status || 'none') }}
          </Badge>
          <p v-if="verification?.rejection_reason" class="rejection-reason">
            반려 사유: {{ verification.rejection_reason }}
          </p>
        </div>

        <!-- 안내 문구 -->
        <div class="info-section card">
          <h3>안내</h3>
          <p>졸업증명서, 경력증명서 등을 업로드해주세요</p>
          <p class="file-info">허용 파일: JPG, PNG, PDF (최대 10MB)</p>
        </div>

        <!-- 파일 업로드 영역 -->
        <div class="upload-section card">
          <label class="upload-area" @click="triggerFileInput">
            <input
              ref="fileInput"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf"
              style="display: none"
              @change="handleFileSelect"
            />
            <div class="upload-icon">📎</div>
            <p>파일을 선택하거나 드래그하여 업로드</p>
            <p class="upload-hint">JPG, PNG, PDF 파일만 가능 (최대 10MB)</p>
          </label>

          <!-- 첨부된 파일 목록 -->
          <div v-if="selectedFiles.length > 0" class="files-list">
            <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
              <div class="file-info">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
              <button class="file-remove-btn" @click="removeFile(index)">×</button>
            </div>
          </div>
        </div>

        <!-- 제출된 파일 목록 (인증 신청 후) -->
        <div v-if="verification?.files && verification.files.length > 0" class="submitted-files card">
          <h3>제출된 서류</h3>
          <div v-for="file in verification.files" :key="file.id" class="file-item">
            <div class="file-info">
              <span class="file-name">{{ file.file_name }}</span>
              <span class="file-size">{{ formatFileSize(file.file_size) }}</span>
            </div>
            <a :href="file.file" target="_blank" class="file-view-btn">보기</a>
          </div>
        </div>

        <!-- 액션 버튼 -->
        <div class="action-section">
          <Button
            v-if="verification?.status === 'rejected' || !verification"
            @click="handleSubmit"
            :loading="verificationStore.loading"
            :disabled="selectedFiles.length === 0"
            full-width
          >
            {{ verification?.status === 'rejected' ? '재신청하기' : '인증 신청하기' }}
          </Button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVerificationStore } from '@/stores/verification'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const verificationStore = useVerificationStore()
const showToast = inject('toast', () => {})

const fileInput = ref(null)
const selectedFiles = ref([])
const loading = computed(() => verificationStore.loading)
const verification = computed(() => verificationStore.verification)

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  const validFiles = []

  files.forEach((file) => {
    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      showToast(`${file.name}: 파일 크기는 10MB 이하만 가능합니다`, 'error')
      return
    }

    // 파일 형식 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast(`${file.name}: JPG, PNG, PDF 파일만 업로드 가능합니다`, 'error')
      return
    }

    validFiles.push(file)
  })

  selectedFiles.value = [...selectedFiles.value, ...validFiles]
  event.target.value = '' // 같은 파일 다시 선택 가능하도록
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const validateFiles = () => {
  if (selectedFiles.value.length === 0) {
    showToast('파일을 1개 이상 선택해주세요', 'error')
    return false
  }

  for (const file of selectedFiles.value) {
    if (file.size > MAX_FILE_SIZE) {
      showToast(`${file.name}: 파일 크기는 10MB 이하만 가능합니다`, 'error')
      return false
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast(`${file.name}: JPG, PNG, PDF 파일만 업로드 가능합니다`, 'error')
      return false
    }
  }

  return true
}

const handleSubmit = async () => {
  if (!validateFiles()) {
    return
  }

  let result
  if (verification.value?.status === 'rejected') {
    result = await verificationStore.resubmitInstructorVerification(selectedFiles.value)
  } else {
    result = await verificationStore.submitInstructorVerification(selectedFiles.value)
  }

  if (result.success) {
    showToast(
      result.data.message || '인증 신청이 완료되었습니다. 검토까지 1-2일 소요됩니다',
      'success'
    )
    selectedFiles.value = []
    await fetchVerification()
  } else {
    if (result.error?.files) {
      showToast(result.error.files[0] || '파일 업로드에 실패했습니다', 'error')
    } else if (result.error?.detail) {
      showToast(result.error.detail, 'error')
    } else {
      showToast('인증 서류 제출에 실패했습니다', 'error')
    }
  }
}

const fetchVerification = async () => {
  await verificationStore.fetchInstructorVerification()
}

const getStatusLabel = (status) => {
  const labels = {
    none: '미인증',
    pending: '인증 대기',
    approved: '인증 완료',
    rejected: '인증 반려',
  }
  return labels[status] || '미인증'
}

const getStatusBadgeVariant = (status) => {
  const variants = {
    none: 'disabled',
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
  }
  return variants[status] || 'disabled'
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

onMounted(() => {
  fetchVerification()
})
</script>

<style scoped>
.verification-page {
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.status-card {
  margin-bottom: var(--spacing-lg);
  text-align: center;
  padding: var(--spacing-xl);
}

.status-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.rejection-reason {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-error);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 14px;
}

.info-section {
  margin-bottom: var(--spacing-lg);
}

.info-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.info-section p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.file-info {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.upload-section {
  margin-bottom: var(--spacing-lg);
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  border: 2px dashed var(--color-divider);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--color-background);
}

.upload-area:hover {
  border-color: var(--color-primary);
  background-color: rgba(167, 199, 231, 0.1);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
}

.upload-area p {
  font-size: 14px;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.upload-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.files-list,
.submitted-files {
  margin-top: var(--spacing-lg);
}

.files-list h3,
.submitted-files h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-sm);
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
}

.file-name {
  font-size: 14px;
  color: var(--color-text-primary);
}

.file-size {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.file-remove-btn,
.file-view-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  transition: color 0.2s;
}

.file-remove-btn:hover {
  color: var(--color-error);
}

.file-view-btn {
  font-size: 14px;
  color: var(--color-primary);
  text-decoration: none;
}

.file-view-btn:hover {
  text-decoration: underline;
}

.action-section {
  margin-top: var(--spacing-xl);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
