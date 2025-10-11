<template>
  <AdminLayout>
    <div class="review-management">
      <!-- 헤더 -->
      <div class="review-management__header">
        <h1>리뷰 관리</h1>
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

      <!-- 리뷰 목록 -->
      <div v-if="!isLoading && filteredReviews.length > 0" class="review-management__content">
        <div v-for="review in filteredReviews" :key="review.id" class="review-card">
          <BaseCard>
            <!-- 작성자 정보 -->
            <div class="review-card__header">
              <div class="author-info">
                <h3 class="author-name">
                  {{ review.authorName }}
                  <BaseBadge variant="info" size="small">
                    {{ review.authorType === 'instructor' ? '강사' : '학원' }}
                  </BaseBadge>
                </h3>
                <p class="target-name">{{ review.targetName }}에 대한 리뷰</p>
              </div>
              <div class="rating">
                <StarIcon :size="16" fill="currentColor" />
                <span>{{ review.rating }}</span>
              </div>
            </div>

            <!-- 리뷰 내용 -->
            <p class="review-content">{{ review.content }}</p>

            <!-- 신고 정보 -->
            <div v-if="review.reportCount > 0" class="report-info">
              <AlertCircleIcon :size="16" />
              <span>신고 {{ review.reportCount }}건</span>
            </div>

            <!-- 하단 정보 -->
            <div class="review-card__footer">
              <span class="date">{{ formatDate(review.createdAt, 'YYYY.MM.DD HH:mm') }}</span>
              <div class="actions">
                <BaseButton
                  v-if="review.status === 'active'"
                  variant="text"
                  size="small"
                  @click="handleHideReview(review.id)"
                >
                  숨기기
                </BaseButton>
                <BaseButton
                  v-if="review.status === 'hidden'"
                  variant="text"
                  size="small"
                  @click="handleShowReview(review.id)"
                >
                  표시
                </BaseButton>
                <BaseButton
                  variant="text"
                  size="small"
                  @click="handleDeleteReview(review.id)"
                >
                  삭제
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
        v-if="!isLoading && filteredReviews.length === 0"
        title="리뷰가 없습니다"
        description="해당 필터에 맞는 리뷰가 없습니다"
      />

      <!-- 삭제 확인 모달 -->
      <BaseModal
        v-model:isOpen="showDeleteModal"
        title="리뷰 삭제"
        confirmText="삭제"
        @confirm="confirmDelete"
        @cancel="showDeleteModal = false"
      >
        <p>정말 삭제하시겠습니까?</p>
        <p class="modal-subtitle">삭제된 리뷰는 복구할 수 없습니다.</p>
      </BaseModal>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Star as StarIcon, AlertCircle as AlertCircleIcon } from 'lucide-vue-next'
import { AdminLayout } from '@/components/layout'
import { BaseCard, BaseBadge, BaseButton, BaseModal, BaseLoading, BaseEmptyState } from '@/components/common'
import { formatDate } from '@/utils/helpers'
import { useToast } from '@/composables/useToast'
import { apiClient } from '@/api'

const { success, error: showError } = useToast()

const tabs = ref([
  { label: '전체', value: 'all', count: 0 },
  { label: '신고된 리뷰', value: 'reported', count: 0 },
  { label: '숨김 처리', value: 'hidden', count: 0 },
])

const activeTab = ref('all')
const reviews = ref([])
const isLoading = ref(false)
const showDeleteModal = ref(false)
const selectedReviewId = ref(null)

const filteredReviews = computed(() => {
  if (activeTab.value === 'all') return reviews.value
  if (activeTab.value === 'reported') return reviews.value.filter((r) => r.reportCount > 0)
  if (activeTab.value === 'hidden') return reviews.value.filter((r) => r.status === 'hidden')
  return reviews.value
})

const handleHideReview = async (reviewId) => {
  try {
    await apiClient.patch(`/admin/reviews/${reviewId}/hide`)
    const review = reviews.value.find((r) => r.id === reviewId)
    if (review) review.status = 'hidden'
    success('리뷰가 숨김 처리되었습니다.')
    updateTabCounts()
  } catch (err) {
    showError('리뷰 숨김 처리에 실패했습니다.')
  }
}

const handleShowReview = async (reviewId) => {
  try {
    await apiClient.patch(`/admin/reviews/${reviewId}/show`)
    const review = reviews.value.find((r) => r.id === reviewId)
    if (review) review.status = 'active'
    success('리뷰가 표시되었습니다.')
    updateTabCounts()
  } catch (err) {
    showError('리뷰 표시 처리에 실패했습니다.')
  }
}

const handleDeleteReview = (reviewId) => {
  selectedReviewId.value = reviewId
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  try {
    await apiClient.delete(`/admin/reviews/${selectedReviewId.value}`)
    reviews.value = reviews.value.filter((r) => r.id !== selectedReviewId.value)
    success('리뷰가 삭제되었습니다.')
    showDeleteModal.value = false
    updateTabCounts()
  } catch (err) {
    showError('리뷰 삭제에 실패했습니다.')
  }
}

const updateTabCounts = () => {
  tabs.value[0].count = reviews.value.length
  tabs.value[1].count = reviews.value.filter((r) => r.reportCount > 0).length
  tabs.value[2].count = reviews.value.filter((r) => r.status === 'hidden').length
}

onMounted(async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get('/admin/reviews')
    reviews.value = response.data
    updateTabCounts()
  } catch (err) {
    showError('리뷰 목록을 불러오는데 실패했습니다.')
  } finally {
    isLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.review-management {
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

.review-card {
  &__header {
    @include flex-between;
    margin-bottom: $spacing-md;

    .author-info {
      flex: 1;

      .author-name {
        font-size: $font-size-body;
        font-weight: $font-weight-semibold;
        margin: 0 0 $spacing-xs 0;
        display: flex;
        align-items: center;
        gap: $spacing-xs;
      }

      .target-name {
        font-size: $font-size-body-small;
        color: $color-text-secondary;
        margin: 0;
      }
    }

    .rating {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      color: $color-warning;
      font-weight: $font-weight-semibold;

      span {
        color: $color-text-primary;
      }
    }
  }

  .review-content {
    font-size: $font-size-body;
    color: $color-text-primary;
    line-height: $line-height-relaxed;
    white-space: pre-line;
    margin: 0 0 $spacing-md 0;
  }

  .report-info {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background-color: rgba($color-error, 0.1);
    border-radius: $radius-sm;
    color: $color-error;
    font-size: $font-size-body-small;
    font-weight: $font-weight-medium;
    margin-bottom: $spacing-md;
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

.modal-subtitle {
  font-size: $font-size-body-small;
  color: $color-text-secondary;
  margin-top: $spacing-sm;
}
</style>

