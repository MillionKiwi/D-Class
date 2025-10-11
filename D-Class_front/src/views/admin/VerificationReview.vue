<template>
  <AdminLayout>
    <div class="verification-review">
      <div class="verification-review__layout">
        <!-- 좌측: 대기 목록 -->
        <aside class="verification-review__sidebar">
          <div class="sidebar-header">
            <h3>대기중인 서류</h3>
            <BaseBadge v-if="pendingList.length > 0" variant="error" dot>
              {{ pendingList.length }}
            </BaseBadge>
          </div>

          <div v-if="isLoading" class="sidebar-loading">
            <BaseLoading type="spinner" inline />
          </div>

          <div v-else-if="pendingList.length > 0" class="pending-list">
            <button
              v-for="item in pendingList"
              :key="item.id"
              :class="['pending-item', { active: selectedItem?.id === item.id }]"
              @click="selectItem(item)"
            >
              <div class="pending-item__info">
                <h4>{{ item.userName }}</h4>
                <p class="type">{{ item.userType === 'instructor' ? '강사' : '학원' }}</p>
                <p class="date">{{ formatDate(item.submittedAt, 'MM.DD HH:mm') }}</p>
              </div>
            </button>
          </div>

          <BaseEmptyState
            v-else
            title="대기중인 서류가 없습니다"
            description="모든 서류가 처리되었습니다"
          />
        </aside>

        <!-- 우측: 서류 뷰어 -->
        <main class="verification-review__main">
          <div v-if="selectedItem" class="document-viewer">
            <!-- 신청자 정보 -->
            <div class="viewer-header">
              <div>
                <h2>{{ selectedItem.userName }}</h2>
                <p class="viewer-meta">
                  {{ selectedItem.userType === 'instructor' ? '강사' : '학원' }} · 
                  {{ formatDate(selectedItem.submittedAt, 'YYYY.MM.DD HH:mm') }}
                </p>
              </div>
            </div>

            <!-- 서류 이미지/PDF 뷰어 -->
            <div class="document-container">
              <div v-if="selectedItem.documents && selectedItem.documents.length > 0" class="documents">
                <div v-for="(doc, index) in selectedItem.documents" :key="index" class="document-item">
                  <h4>서류 {{ index + 1 }}</h4>
                  <div class="document-preview">
                    <img v-if="isImage(doc.url)" :src="doc.url" alt="인증 서류" />
                    <iframe v-else-if="isPdf(doc.url)" :src="doc.url" />
                    <p v-else>미리보기를 지원하지 않는 파일 형식입니다</p>
                  </div>
                  <div class="document-controls">
                    <BaseButton variant="secondary" @click="downloadDocument(doc.url)">
                      다운로드
                    </BaseButton>
                    <BaseButton variant="secondary" @click="openInNewTab(doc.url)">
                      새 탭에서 보기
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>

            <!-- 하단 액션 버튼 -->
            <div class="viewer-actions">
              <BaseButton variant="danger" @click="handleReject">반려</BaseButton>
              <BaseButton @click="handleApprove">승인</BaseButton>
            </div>
          </div>

          <BaseEmptyState
            v-else
            title="서류를 선택하세요"
            description="좌측 목록에서 검토할 서류를 선택해주세요"
          />
        </main>
      </div>

      <!-- 승인 확인 모달 -->
      <BaseModal
        v-model:isOpen="showApproveModal"
        title="인증 승인"
        @confirm="confirmApprove"
        @cancel="showApproveModal = false"
      >
        <p>해당 서류를 승인하시겠습니까?</p>
        <div class="modal-info">
          <p>✓ 신청자에게 알림 발송</p>
          <p>✓ 인증 완료 상태로 변경</p>
        </div>
      </BaseModal>

      <!-- 반려 모달 -->
      <BaseModal
        v-model:isOpen="showRejectModal"
        title="인증 반려"
        confirmText="반려"
        @confirm="confirmReject"
        @cancel="showRejectModal = false"
      >
        <p>해당 서류를 반려하시겠습니까?</p>
        <div class="reject-form">
          <BaseInput
            v-model="rejectReason"
            label="반려 사유"
            textarea
            :rows="4"
            placeholder="반려 사유를 입력하세요 (신청자에게 전달됩니다)"
            required
          />
        </div>
      </BaseModal>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { AdminLayout } from '@/components/layout'
import { BaseButton, BaseBadge, BaseModal, BaseLoading, BaseEmptyState, BaseInput } from '@/components/common'
import { formatDate } from '@/utils/helpers'
import { useToast } from '@/composables/useToast'
import { apiClient } from '@/api'

const { success, error: showError } = useToast()

const pendingList = ref([])
const selectedItem = ref(null)
const isLoading = ref(false)

const showApproveModal = ref(false)
const showRejectModal = ref(false)
const rejectReason = ref('')

const isImage = (url) => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
}

const isPdf = (url) => {
  return /\.pdf$/i.test(url)
}

const downloadDocument = (url) => {
  window.open(url, '_blank')
}

const openInNewTab = (url) => {
  window.open(url, '_blank')
}

const selectItem = (item) => {
  selectedItem.value = item
}

const fetchPendingVerifications = async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get('/admin/verifications/pending')
    pendingList.value = response.data
    
    // 첫 번째 항목 자동 선택
    if (pendingList.value.length > 0 && !selectedItem.value) {
      selectedItem.value = pendingList.value[0]
    }
  } catch (err) {
    showError('인증 서류 목록을 불러오는데 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

const handleApprove = () => {
  showApproveModal.value = true
}

const confirmApprove = async () => {
  try {
    await apiClient.patch(`/admin/verifications/${selectedItem.value.id}/approve`)
    
    // 목록에서 제거
    const index = pendingList.value.findIndex((item) => item.id === selectedItem.value.id)
    if (index > -1) {
      pendingList.value.splice(index, 1)
    }

    // 다음 항목 자동 선택
    if (pendingList.value.length > 0) {
      selectedItem.value = pendingList.value[0]
    } else {
      selectedItem.value = null
    }

    success('인증이 승인되었습니다.')
    showApproveModal.value = false
  } catch (err) {
    showError('인증 승인에 실패했습니다.')
  }
}

const handleReject = () => {
  rejectReason.value = ''
  showRejectModal.value = true
}

const confirmReject = async () => {
  if (!rejectReason.value) {
    showError('반려 사유를 입력해주세요')
    return
  }

  try {
    await apiClient.patch(`/admin/verifications/${selectedItem.value.id}/reject`, {
      reason: rejectReason.value,
    })
    
    // 목록에서 제거
    const index = pendingList.value.findIndex((item) => item.id === selectedItem.value.id)
    if (index > -1) {
      pendingList.value.splice(index, 1)
    }

    // 다음 항목 자동 선택
    if (pendingList.value.length > 0) {
      selectedItem.value = pendingList.value[0]
    } else {
      selectedItem.value = null
    }

    success('인증이 반려되었습니다.')
    showRejectModal.value = false
  } catch (err) {
    showError('인증 반려에 실패했습니다.')
  }
}

onMounted(() => {
  fetchPendingVerifications()
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.verification-review {
  &__layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: $spacing-lg;
    height: calc(100vh - 200px);

    @include mobile {
      grid-template-columns: 1fr;
      height: auto;
    }
  }

  &__sidebar {
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .sidebar-header {
      @include flex-between;
      padding: $spacing-lg;
      border-bottom: 1px solid $color-divider;
      background-color: $color-background;

      h3 {
        font-size: $font-size-h3;
        margin: 0;
      }
    }

    .sidebar-loading {
      padding: $spacing-xl;
    }

    .pending-list {
      flex: 1;
      overflow-y: auto;
      @include custom-scrollbar;
    }
  }

  &__main {
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.pending-item {
  width: 100%;
  padding: $spacing-lg;
  border: none;
  border-bottom: 1px solid $color-divider;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background-color: $color-background;
  }

  &.active {
    background-color: rgba($color-primary, 0.1);
    border-left: 4px solid $color-primary;
  }

  &__info {
    h4 {
      font-size: $font-size-body;
      font-weight: $font-weight-semibold;
      margin: 0 0 $spacing-xs 0;
      color: $color-text-primary;
    }

    .type {
      font-size: $font-size-body-small;
      color: $color-primary;
      margin: 0 0 $spacing-xs 0;
    }

    .date {
      font-size: $font-size-caption;
      color: $color-text-secondary;
      margin: 0;
    }
  }
}

.document-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;

  .viewer-header {
    padding: $spacing-xl;
    border-bottom: 1px solid $color-divider;

    h2 {
      font-size: $font-size-h2;
      font-weight: $font-weight-bold;
      margin: 0 0 $spacing-xs 0;
    }

    .viewer-meta {
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      margin: 0;
    }
  }

  .document-container {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-xl;
    @include custom-scrollbar;
  }

  .documents {
    display: flex;
    flex-direction: column;
    gap: $spacing-2xl;
  }

  .document-item {
    h4 {
      font-size: $font-size-body;
      font-weight: $font-weight-semibold;
      margin: 0 0 $spacing-md 0;
    }
  }

  .document-preview {
    border: 1px solid $color-divider;
    border-radius: $radius-md;
    overflow: hidden;
    margin-bottom: $spacing-md;
    background-color: $color-background;

    img {
      width: 100%;
      height: auto;
      display: block;
    }

    iframe {
      width: 100%;
      height: 600px;
      border: none;
    }

    p {
      padding: $spacing-3xl;
      text-align: center;
      color: $color-text-secondary;
    }
  }

  .document-controls {
    display: flex;
    gap: $spacing-sm;
  }

  .viewer-actions {
    padding: $spacing-xl;
    border-top: 1px solid $color-divider;
    display: flex;
    gap: $spacing-md;
    justify-content: flex-end;
  }
}

.modal-info {
  margin-top: $spacing-lg;
  padding: $spacing-md;
  background-color: $color-background;
  border-radius: $radius-md;

  p {
    font-size: $font-size-body-small;
    color: $color-text-primary;
    margin: $spacing-xs 0;
  }
}

.reject-form {
  margin-top: $spacing-lg;
}
</style>

