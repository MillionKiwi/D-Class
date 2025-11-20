<template>
  <AppLayout>
    <div class="reviews-page page-container">
      <div class="page-header">
        <h1 class="page-title">내가 작성한 리뷰</h1>
      </div>

      <div v-if="loading && reviews.length === 0" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else-if="reviews.length > 0" class="reviews-list">
        <Card v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-header">
            <div class="review-target">
              <h3>
                {{ review.instructor?.name || '강사' }}
                <Badge v-if="review.instructor?.is_verified" variant="success" small>✓</Badge>
              </h3>
            </div>
            <div class="review-rating">
              <span v-for="star in 5" :key="star" :class="{ active: star <= review.rating }">
                ⭐
              </span>
            </div>
          </div>

          <p class="review-content">{{ review.content }}</p>

          <div class="review-footer">
            <span class="review-date">{{ formatDate(review.created_at) }}</span>
            <div class="review-actions">
              <Button variant="text" small @click="handleEdit(review)">수정</Button>
              <Button variant="text" small @click="handleDelete(review)">삭제</Button>
            </div>
          </div>
        </Card>
      </div>

      <div v-else class="empty-state">
        <p>아직 작성한 리뷰가 없습니다</p>
      </div>

      <!-- 삭제 확인 모달 -->
      <Modal v-model:visible="showDeleteModal" title="리뷰 삭제" @close="showDeleteModal = false">
        <p>정말 삭제하시겠습니까?</p>
        <template #footer>
          <Button variant="secondary" @click="showDeleteModal = false">취소</Button>
          <Button variant="error" @click="confirmDelete">삭제</Button>
        </template>
      </Modal>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReviewStore } from '@/stores/review'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'

const router = useRouter()
const reviewStore = useReviewStore()
const showToast = inject('toast', () => {})

const { reviews, loading } = reviewStore
const showDeleteModal = ref(false)
const deleteTargetId = ref(null)

const fetchReviews = async () => {
  await reviewStore.fetchMyReviews()
}

const handleEdit = (review) => {
  router.push({
    name: 'ReviewEdit',
    params: { id: review.id },
  })
}

const handleDelete = (review) => {
  deleteTargetId.value = review.id
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  const result = await reviewStore.deleteReview(deleteTargetId.value)
  if (result.success) {
    showToast('리뷰가 삭제되었습니다', 'success')
    showDeleteModal.value = false
    await fetchReviews()
  } else {
    showToast(result.error || '리뷰 삭제에 실패했습니다', 'error')
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped>
.reviews-page {
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

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.review-card {
  padding: var(--spacing-lg);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.review-target h3 {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.review-rating {
  display: flex;
  gap: 2px;
}

.review-rating span {
  font-size: 14px;
  opacity: 0.3;
}

.review-rating span.active {
  opacity: 1;
}

.review-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  white-space: pre-wrap;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-divider);
}

.review-date {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.review-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
