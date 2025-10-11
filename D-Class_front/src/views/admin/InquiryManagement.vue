<template>
  <AdminLayout>
    <div class="inquiry-management">
      <!-- 헤더 -->
      <div class="inquiry-management__header">
        <h1>문의/신고 관리</h1>
      </div>

      <!-- 필터 탭 -->
      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <BaseBadge v-if="tab.count > 0" variant="primary" size="small">
            {{ tab.count }}
          </BaseBadge>
        </button>
      </div>

      <!-- 문의/신고 목록 -->
      <div v-if="!isLoading && filteredInquiries.length > 0" class="inquiry-management__content">
        <div v-for="inquiry in filteredInquiries" :key="inquiry.id" class="inquiry-card">
          <BaseCard clickable @click="handleCardClick(inquiry)">
            <!-- 헤더 -->
            <div class="inquiry-card__header">
              <div class="inquiry-info">
                <h3 class="inquiry-title">
                  <BaseBadge
                    :variant="inquiry.type === 'inquiry' ? 'info' : 'warning'"
                    size="small"
                  >
                    {{ inquiry.type === 'inquiry' ? '문의' : '신고' }}
                  </BaseBadge>
                  {{ inquiry.title }}
                </h3>
                <p class="inquiry-author">{{ inquiry.authorName }} ({{ inquiry.authorRole }})</p>
              </div>
              <BaseBadge
                :variant="getStatusVariant(inquiry.status)"
                size="small"
              >
                {{ getStatusLabel(inquiry.status) }}
              </BaseBadge>
            </div>

            <!-- 내용 미리보기 -->
            <p class="inquiry-preview">{{ inquiry.content }}</p>

            <!-- 하단 정보 -->
            <div class="inquiry-card__footer">
              <span class="date">{{ formatDate(inquiry.createdAt, 'YYYY.MM.DD HH:mm') }}</span>
              <div class="actions">
                <BaseButton
                  v-if="inquiry.status === 'pending'"
                  variant="text"
                  size="small"
                  @click.stop="handleRespond(inquiry)"
                >
                  답변하기
                </BaseButton>
                <BaseButton
                  v-if="inquiry.status === 'pending'"
                  variant="text"
                  size="small"
                  @click.stop="handleComplete(inquiry.id)"
                >
                  완료 처리
                </BaseButton>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- 로딩 -->
      <BaseLoading v-if="isLoading" type="skeleton" inline :lines="5" />

      <!-- 빈 상태 -->
      <BaseEmptyState
        v-if="!isLoading && filteredInquiries.length === 0"
        title="문의/신고가 없습니다"
        description="해당 필터에 맞는 문의/신고가 없습니다"
      />

      <!-- 답변 모달 -->
      <BaseModal
        v-model:isOpen="showResponseModal"
        title="답변 작성"
        confirmText="답변 전송"
        @confirm="submitResponse"
        @cancel="showResponseModal = false"
      >
        <div class="response-modal">
          <div class="original-inquiry">
            <p class="modal-label">문의 내용</p>
            <p class="modal-content">{{ selectedInquiry?.content }}</p>
          </div>
          <BaseInput
            v-model="responseText"
            textarea
            placeholder="답변을 입력해주세요"
            :rows="6"
            :minlength="10"
            :maxlength="500"
            :showCounter="true"
          />
        </div>
      </BaseModal>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AdminLayout } from '@/components/layout'
import { BaseCard, BaseBadge, BaseButton, BaseModal, BaseInput, BaseLoading, BaseEmptyState } from '@/components/common'
import { formatDate } from '@/utils/helpers'
import { useToast } from '@/composables/useToast'
import { apiClient } from '@/api'

const router = useRouter()
const { success, error: showError } = useToast()

const tabs = ref([
  { label: '전체', value: 'all', count: 0 },
  { label: '미처리', value: 'pending', count: 0 },
  { label: '처리완료', value: 'completed', count: 0 },
])

const activeTab = ref('all')
const inquiries = ref([])
const isLoading = ref(false)
const showResponseModal = ref(false)
const selectedInquiry = ref(null)
const responseText = ref('')

const filteredInquiries = computed(() => {
  if (activeTab.value === 'all') return inquiries.value
  return inquiries.value.filter((i) => i.status === activeTab.value)
})

const getStatusLabel = (status) => {
  const labels = {
    pending: '미처리',
    in_progress: '처리중',
    completed: '완료',
  }
  return labels[status] || status
}

const getStatusVariant = (status) => {
  const variants = {
    pending: 'warning',
    in_progress: 'info',
    completed: 'success',
  }
  return variants[status] || 'default'
}

const handleCardClick = (inquiry) => {
  // 상세 페이지로 이동 (필요시 구현)
  console.log('View inquiry detail:', inquiry.id)
}

const handleRespond = (inquiry) => {
  selectedInquiry.value = inquiry
  responseText.value = ''
  showResponseModal.value = true
}

const submitResponse = async () => {
  if (!responseText.value.trim() || responseText.value.trim().length < 10) {
    showError('답변은 최소 10자 이상 입력해주세요.')
    return
  }

  try {
    await apiClient.post(`/admin/inquiries/${selectedInquiry.value.id}/response`, {
      response: responseText.value.trim(),
    })

    const inquiry = inquiries.value.find((i) => i.id === selectedInquiry.value.id)
    if (inquiry) {
      inquiry.status = 'completed'
      inquiry.response = responseText.value.trim()
    }

    success('답변이 전송되었습니다.')
    showResponseModal.value = false
    updateTabCounts()
  } catch (err) {
    showError('답변 전송에 실패했습니다.')
  }
}

const handleComplete = async (inquiryId) => {
  try {
    await apiClient.patch(`/admin/inquiries/${inquiryId}/complete`)
    
    const inquiry = inquiries.value.find((i) => i.id === inquiryId)
    if (inquiry) inquiry.status = 'completed'

    success('완료 처리되었습니다.')
    updateTabCounts()
  } catch (err) {
    showError('완료 처리에 실패했습니다.')
  }
}

const updateTabCounts = () => {
  tabs.value[0].count = inquiries.value.length
  tabs.value[1].count = inquiries.value.filter((i) => i.status === 'pending').length
  tabs.value[2].count = inquiries.value.filter((i) => i.status === 'completed').length
}

onMounted(async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get('/admin/inquiries')
    inquiries.value = response.data
    updateTabCounts()
  } catch (err) {
    showError('문의/신고 목록을 불러오는데 실패했습니다.')
  } finally {
    isLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.inquiry-management {
  &__header {
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;

    h1 {
      font-size: $font-size-h2;
      font-weight: $font-weight-semibold;
      margin: 0;
      text-align: center;
    }
  }

  &__content {
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
}

.filter-tabs {
  display: flex;
  background-color: $color-white;
  border-bottom: 1px solid $color-divider;
  overflow-x: auto;

  .tab {
    flex: 1;
    min-width: fit-content;
    padding: $spacing-md $spacing-lg;
    border: none;
    background: none;
    color: $color-text-secondary;
    font-size: $font-size-body;
    font-weight: $font-weight-medium;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    transition: color $transition-fast;

    &:hover {
      color: $color-text-primary;
    }

    &.active {
      color: $color-primary;
      font-weight: $font-weight-semibold;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background-color: $color-primary;
      }
    }
  }
}

.inquiry-card {
  &__header {
    @include flex-between;
    margin-bottom: $spacing-md;
    align-items: flex-start;

    .inquiry-info {
      flex: 1;

      .inquiry-title {
        font-size: $font-size-body;
        font-weight: $font-weight-semibold;
        margin: 0 0 $spacing-xs 0;
        display: flex;
        align-items: center;
        gap: $spacing-xs;
      }

      .inquiry-author {
        font-size: $font-size-body-small;
        color: $color-text-secondary;
        margin: 0;
      }
    }
  }

  .inquiry-preview {
    font-size: $font-size-body;
    color: $color-text-primary;
    line-height: $line-height-relaxed;
    margin: 0 0 $spacing-md 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__footer {
    @include flex-between;
    padding-top: $spacing-md;
    border-top: 1px solid $color-divider;

    .date {
      font-size: $font-size-caption;
      color: $color-text-secondary;
    }

    .actions {
      display: flex;
      gap: $spacing-sm;
    }
  }
}

.response-modal {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;

  .original-inquiry {
    padding: $spacing-md;
    background-color: $color-background;
    border-radius: $radius-md;

    .modal-label {
      font-size: $font-size-body-small;
      font-weight: $font-weight-semibold;
      color: $color-text-secondary;
      margin: 0 0 $spacing-xs 0;
    }

    .modal-content {
      font-size: $font-size-body;
      color: $color-text-primary;
      line-height: $line-height-relaxed;
      margin: 0;
    }
  }
}
</style>

