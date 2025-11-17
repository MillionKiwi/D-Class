<template>
  <AppLayout>
    <div class="review-write-page page-container">
      <div class="page-header">
        <button class="back-btn" @click="handleBack">←</button>
        <h1 class="page-title">리뷰 작성</h1>
        <Button @click="handleSubmit" :loading="reviewStore.loading" :disabled="!isValid">
          완료
        </Button>
      </div>

      <div v-if="application" class="review-form">
        <div class="target-info card">
          <h3>{{ targetName }}</h3>
          <p class="target-meta">근무 기간: {{ formatDateRange(application) }}</p>
        </div>

        <div class="rating-section card">
          <label class="rating-label">평점</label>
          <div class="stars">
            <button
              v-for="star in 5"
              :key="star"
              :class="['star-btn', { active: rating >= star }]"
              @click="rating = star"
            >
              ⭐
            </button>
          </div>
        </div>

        <div class="content-section card">
          <label class="content-label">
            리뷰 내용
            <span class="char-count">{{ content.length }}/500</span>
          </label>
          <textarea
            v-model="content"
            class="review-textarea"
            placeholder="솔직하고 객관적인 리뷰를 부탁드립니다"
            maxlength="500"
            rows="8"
          ></textarea>
          <p v-if="content.length > 0 && content.length < 10" class="error-message">
            최소 10자 이상 입력해주세요
          </p>
        </div>
      </div>

      <div v-else class="loading-container">
        <LoadingSpinner />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReviewStore } from '@/stores/review'
import { useApplicationStore } from '@/stores/application'
import { useAuthStore } from '@/stores/auth'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Button from '@/components/common/Button.vue'
import Card from '@/components/common/Card.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const reviewStore = useReviewStore()
const applicationStore = useApplicationStore()
const authStore = useAuthStore()
const showToast = inject('toast')

const applicationId = ref(route.params.applicationId)
const application = ref(null)
const rating = ref(0)
const content = ref('')
const hasChanges = ref(false)

const isValid = computed(() => {
  return rating.value > 0 && content.value.length >= 10
})

const targetName = computed(() => {
  if (!application.value) return ''
  const userRole = authStore.user?.role
  if (userRole === 'instructor') {
    return application.value.job_posting?.academy?.name || '학원'
  } else {
    return application.value.instructor?.name || '강사'
  }
})

const fetchApplication = async () => {
  const result = await applicationStore.fetchApplicationDetail(applicationId.value)
  if (result.success) {
    application.value = result.data
  } else {
    showToast('지원 정보를 불러오는데 실패했습니다', 'error')
    router.push('/applications')
  }
}

const formatDateRange = (app) => {
  if (!app) return ''
  // 실제로는 지원일부터 현재까지 또는 근무 기간을 표시
  const date = new Date(app.created_at)
  return date.toLocaleDateString('ko-KR')
}

const handleSubmit = async () => {
  if (!isValid.value) {
    showToast('평점과 리뷰 내용(10자 이상)을 입력해주세요', 'error')
    return
  }

  const result = await reviewStore.createReview({
    application_id: applicationId.value,
    rating: rating.value,
    content: content.value,
  })

  if (result.success) {
    showToast('리뷰가 등록되었습니다', 'success')
    router.push('/reviews/my')
  } else {
    showToast(result.error || '리뷰 작성에 실패했습니다', 'error')
  }
}

const handleBack = () => {
  if (hasChanges.value) {
    if (confirm('작성 중인 리뷰가 있습니다. 나가시겠습니까?')) {
      router.push('/applications')
    }
  } else {
    router.push('/applications')
  }
}

onMounted(() => {
  fetchApplication()
})
</script>

<style scoped>
.review-write-page {
  padding: var(--spacing-lg);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-primary);
  padding: var(--spacing-sm);
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  flex: 1;
  text-align: center;
}

.target-info {
  margin-bottom: var(--spacing-lg);
}

.target-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.target-meta {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.rating-section {
  margin-bottom: var(--spacing-lg);
}

.rating-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.stars {
  display: flex;
  gap: var(--spacing-sm);
}

.star-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 0;
}

.star-btn:hover {
  transform: scale(1.1);
}

.star-btn.active {
  filter: drop-shadow(0 0 4px var(--color-accent));
}

.content-section {
  margin-bottom: var(--spacing-lg);
}

.content-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.char-count {
  font-size: 14px;
  font-weight: normal;
  color: var(--color-text-secondary);
}

.review-textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 200px;
}

.review-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  border-width: 2px;
}

.error-message {
  margin-top: var(--spacing-xs);
  font-size: 12px;
  color: var(--color-error);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
