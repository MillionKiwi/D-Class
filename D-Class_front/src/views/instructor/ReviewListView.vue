<template>
  <AppLayout>
    <div class="review-list-page page-container">
      <div class="page-header">
        <h1 class="page-title">{{ title }}</h1>
      </div>

      <div v-if="reviewData" class="review-summary card">
        <div class="summary-header">
          <h2>{{ reviewData.academy?.name || reviewData.instructor?.name || '리뷰' }}</h2>
          <div class="rating-info">
            <span class="rating-value">⭐ {{ averageRating || 'N/A' }}</span>
            <span class="review-count">({{ reviewCount }}개 리뷰)</span>
          </div>
        </div>
        <div v-if="ratingDistribution && reviewCount > 0" class="rating-distribution">
          <div
            v-for="(count, star) in ratingDistribution"
            :key="star"
            class="distribution-item"
          >
            <span class="star-label">{{ star }}점</span>
            <div class="distribution-bar">
              <div
                class="distribution-fill"
                :style="{ width: `${(count / reviewCount) * 100}%` }"
              ></div>
            </div>
            <span class="count-label">{{ count }}</span>
          </div>
        </div>
      </div>

      <div class="sort-section">
        <select v-model="ordering" class="sort-select">
          <option value="-created_at">최신순</option>
          <option value="rating">평점 높은순</option>
          <option value="-rating">평점 낮은순</option>
        </select>
      </div>

      <div v-if="loading && reviews.length === 0" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else-if="reviews.length > 0" class="reviews-list">
        <Card v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-header">
            <span class="review-author">{{ review.author || '익명' }}</span>
            <div class="review-rating">
              <span v-for="star in 5" :key="star" :class="{ active: star <= review.rating }">
                ⭐
              </span>
            </div>
          </div>
          <p class="review-content">{{ review.content }}</p>
          <div class="review-footer">
            <span class="review-date">{{ formatDate(review.created_at) }}</span>
          </div>
        </Card>
      </div>

      <div v-else class="empty-state">
        <p>아직 작성된 리뷰가 없습니다</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useReviewStore } from '@/stores/review'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const reviewStore = useReviewStore()

const props = defineProps({
  targetType: {
    type: String,
    required: false,
    validator: (value) => !value || ['academy', 'instructor'].includes(value),
  },
  targetId: {
    type: [String, Number],
    required: false,
  },
})

// 라우트 파라미터 또는 props에서 값을 가져옴
const targetType = computed(() => {
  return props.targetType || route.params.targetType
})

const targetId = computed(() => {
  return props.targetId || route.params.targetId
})

const title = computed(() => {
  return targetType.value === 'academy' ? '학원 리뷰' : '강사 리뷰'
})

const ordering = ref('-created_at')
const reviewData = ref(null)
const reviews = ref([])
const loading = computed(() => reviewStore.loading)

const averageRating = computed(() => {
  if (!reviewData.value) return 0
  return reviewData.value.academy?.average_rating || reviewData.value.instructor?.average_rating || 0
})

const reviewCount = computed(() => {
  if (!reviewData.value) return 0
  return reviewData.value.count || 0
})

const ratingDistribution = computed(() => {
  if (!reviewData.value) return null
  return reviewData.value.rating_distribution || null
})

const fetchReviews = async () => {
  if (!targetType.value || !targetId.value) {
    console.error('targetType or targetId is missing')
    return
  }

  const params = { ordering: ordering.value }
  let result

  if (targetType.value === 'academy') {
    result = await reviewStore.fetchAcademyReviews(targetId.value, params)
  } else {
    result = await reviewStore.fetchInstructorReviews(targetId.value, params)
  }

  if (result.success) {
    // API 응답 구조: { count, next, previous, results: { academy/instructor, rating_distribution, count, results: [...] } }
    // results가 중첩되어 있으므로 result.data.results가 실제 데이터 객체
    if (result.data.results && typeof result.data.results === 'object' && !Array.isArray(result.data.results)) {
      // Pagination이 적용된 경우
      reviewData.value = result.data.results
      reviews.value = result.data.results.results || []
    } else {
      // Pagination이 적용되지 않은 경우 (직접 Response 반환)
    reviewData.value = result.data
    reviews.value = result.data.results || []
    }
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

watch(ordering, () => {
  fetchReviews()
})

// 라우트 파라미터 변경 감지
watch(() => route.params, () => {
  fetchReviews()
}, { deep: true })

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped>
.review-list-page {
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

.review-summary {
  margin-bottom: var(--spacing-xl);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.summary-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.rating-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.rating-value {
  font-size: 20px;
  font-weight: 700;
}

.review-count {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.star-label {
  font-size: 12px;
  width: 30px;
  color: var(--color-text-secondary);
}

.distribution-bar {
  flex: 1;
  height: 8px;
  background-color: var(--color-divider);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.distribution-fill {
  height: 100%;
  background-color: var(--color-primary);
  transition: width 0.3s;
}

.count-label {
  font-size: 12px;
  width: 30px;
  text-align: right;
  color: var(--color-text-secondary);
}

.sort-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-lg);
}

.sort-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-sm);
  font-size: 14px;
  background-color: white;
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
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.review-author {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
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
  justify-content: flex-end;
}

.review-date {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
