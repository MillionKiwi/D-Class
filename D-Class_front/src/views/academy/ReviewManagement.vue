<template>
  <AcademyLayout>
    <div class="review-management">
      <!-- 헤더 -->
      <div class="review-management__header">
        <h1>리뷰 관리</h1>
      </div>

      <!-- 리뷰 목록 -->
      <div v-if="!isLoading && reviews.length > 0" class="review-management__content">
        <div v-for="review in reviews" :key="review.id" class="review-card">
          <BaseCard>
            <!-- 강사 정보 -->
            <div class="review-card__header">
              <h3 class="instructor-name">
                {{ review.instructorName }}
                <BaseBadge v-if="review.isVerified" variant="success" size="small">✓</BaseBadge>
              </h3>
              <div class="rating">
                <StarIcon :size="16" fill="currentColor" />
                <span>{{ review.rating }}</span>
              </div>
            </div>

            <!-- 리뷰 내용 -->
            <p class="review-content">{{ review.content }}</p>

            <!-- 작성일 -->
            <div class="review-card__footer">
              <span class="date">{{ formatDate(review.createdAt, 'YYYY.MM.DD') }}</span>
              <div class="actions">
                <BaseButton variant="text" @click="handleEdit(review)">수정</BaseButton>
                <BaseButton variant="text" @click="handleDelete(review)">삭제</BaseButton>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- 로딩 -->
      <BaseLoading v-if="isLoading" type="skeleton" inline :lines="5" />

      <!-- 빈 상태 -->
      <BaseEmptyState
        v-if="!isLoading && reviews.length === 0"
        title="아직 작성한 리뷰가 없습니다"
        description="채용이 확정된 강사에 대한 리뷰를 작성해보세요"
      >
        <template #action>
          <BaseButton @click="$router.push('/academy/hired')">채용 현황 보기</BaseButton>
        </template>
      </BaseEmptyState>

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
  </AcademyLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft as ArrowLeftIcon, Star as StarIcon } from 'lucide-vue-next'
import { AcademyLayout } from '@/components/layout'
import { BaseCard, BaseBadge, BaseButton, BaseModal, BaseLoading, BaseEmptyState } from '@/components/common'
import { formatDate } from '@/utils/helpers'
import { useToast } from '@/composables/useToast'
import { apiClient } from '@/api'

const router = useRouter()
const { success, error: showError } = useToast()

const reviews = ref([])
const isLoading = ref(false)
const showDeleteModal = ref(false)
const selectedReview = ref(null)

const handleEdit = (review) => {
  router.push({
    path: `/academy/reviews/edit/${review.id}`,
    query: { instructorId: review.instructorId },
  })
}

const handleDelete = (review) => {
  selectedReview.value = review
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  try {
    await apiClient.delete(`/reviews/${selectedReview.value.id}`)
    reviews.value = reviews.value.filter((r) => r.id !== selectedReview.value.id)
    success('리뷰가 삭제되었습니다.')
    showDeleteModal.value = false
  } catch (err) {
    showError('리뷰 삭제에 실패했습니다.')
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get('/reviews/me')
    reviews.value = response.data
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

.review-card {
  &__header {
    @include flex-between;
    margin-bottom: $spacing-md;

    .instructor-name {
      font-size: $font-size-body;
      font-weight: $font-weight-semibold;
      margin: 0;
      display: flex;
      align-items: center;
      gap: $spacing-xs;
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

