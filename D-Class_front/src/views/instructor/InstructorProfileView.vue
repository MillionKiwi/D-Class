<template>
  <AppLayout>
    <div v-if="loading && !instructor" class="loading-container">
      <LoadingSpinner />
    </div>

    <div v-else-if="instructor" class="instructor-profile-page page-container">
      <!-- 강사 기본 정보 -->
      <div class="instructor-header card">
        <div class="profile-avatar">
          <img
            v-if="instructor.profile_image"
            :src="instructor.profile_image"
            alt="프로필 이미지"
            class="avatar-image"
          />
          <div v-else class="avatar-placeholder">👤</div>
        </div>
        <div class="instructor-info">
          <h2 class="instructor-name">
            {{ instructor.name }}
            <Badge v-if="instructor.is_verified" variant="success" small>✓</Badge>
          </h2>
          <div class="instructor-rating">
            <span class="rating-value">⭐ {{ instructor.average_rating || 'N/A' }}</span>
            <span class="review-count">({{ instructor.review_count || 0 }}개 리뷰)</span>
          </div>
          <div v-if="instructor.specialties && instructor.specialties.length > 0" class="specialties">
            <span
              v-for="specialty in instructor.specialties"
              :key="specialty"
              class="specialty-chip"
            >
              {{ getSpecialtyLabel(specialty) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 자기소개 -->
      <div v-if="instructor.bio" class="bio-section card">
        <h3>자기소개</h3>
        <p>{{ instructor.bio }}</p>
      </div>

      <!-- 전문 분야 -->
      <div v-if="instructor.specialties && instructor.specialties.length > 0" class="specialties-section card">
        <h3>전문 분야</h3>
        <div class="specialty-chips">
          <span v-for="specialty in instructor.specialties" :key="specialty" class="specialty-chip">
            {{ getSpecialtyLabel(specialty) }}
          </span>
        </div>
      </div>

      <!-- 경력 -->
      <div v-if="instructor.experiences && instructor.experiences.length > 0" class="experiences-section card">
        <h3>경력</h3>
        <div v-for="experience in instructor.experiences" :key="experience.id" class="experience-item">
          <div class="experience-header">
            <h4 class="institution">{{ experience.institution }}</h4>
            <span class="position">{{ experience.position }}</span>
          </div>
          <div class="experience-dates">
            {{ formatDate(experience.start_date) }} ~
            {{ experience.end_date ? formatDate(experience.end_date) : '현재' }}
          </div>
          <p v-if="experience.description" class="experience-description">
            {{ experience.description }}
          </p>
        </div>
      </div>

      <!-- 학력 -->
      <div v-if="instructor.educations && instructor.educations.length > 0" class="educations-section card">
        <h3>학력</h3>
        <div v-for="education in instructor.educations" :key="education.id" class="education-item">
          <div class="education-header">
            <h4 class="school">{{ education.school }}</h4>
            <span class="degree">{{ getDegreeLabel(education.degree) }}</span>
          </div>
          <div class="education-info">
            <span class="major">{{ education.major }}</span>
            <span class="education-dates">
              {{ formatDate(education.start_date) }} ~
              {{ education.end_date ? formatDate(education.end_date) : '현재' }}
            </span>
          </div>
          <p v-if="education.description" class="education-description">
            {{ education.description }}
          </p>
        </div>
      </div>

      <!-- 리뷰 미리보기 -->
      <div v-if="reviews.length > 0" class="reviews-section card">
        <div class="reviews-header">
          <h3>리뷰</h3>
          <Button variant="secondary" small @click="viewAllReviews">전체 보기</Button>
        </div>
        <div v-for="review in reviews.slice(0, 3)" :key="review.id" class="review-item">
          <div class="review-header">
            <span class="review-rating">⭐ {{ review.rating }}</span>
            <span class="review-author">{{ review.author }}</span>
            <span class="review-date">{{ formatDate(review.created_at) }}</span>
          </div>
          <p class="review-content">{{ review.content }}</p>
        </div>
      </div>

      <!-- 리뷰 전체 보기 버튼 -->
      <div v-if="instructor.review_count > 0" class="view-all-reviews">
        <Button variant="secondary" full-width @click="viewAllReviews">
          리뷰 {{ instructor.review_count }}개 전체 보기
        </Button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'
import { useReviewStore } from '@/stores/review'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const reviewStore = useReviewStore()
const showToast = inject('toast', () => {})

const instructorId = computed(() => route.params.id)
const instructor = ref(null)
const reviews = ref([])
const loading = ref(false)

const specialtyLabels = {
  ballet: '발레',
  contemporary: '현대무용',
  korean: '한국무용',
  jazz: '재즈댄스',
  hiphop: '힙합',
  ballroom: '볼룸댄스',
  etc: '기타',
}

const degreeLabels = {
  bachelor: '학사',
  master: '석사',
  doctor: '박사',
  etc: '기타',
}

const fetchInstructor = async () => {
  loading.value = true
  try {
    const response = await apiClient.get(API_ENDPOINTS.INSTRUCTORS.DETAIL(instructorId.value))
    instructor.value = response.data

    // 리뷰 미리보기 로드
    const reviewResult = await reviewStore.fetchInstructorReviews(instructorId.value, {
      page_size: 3,
    })
    if (reviewResult.success) {
      reviews.value = reviewResult.data.results || []
    }
  } catch (error) {
    showToast('강사 정보를 불러오는데 실패했습니다', 'error')
  } finally {
    loading.value = false
  }
}

const viewAllReviews = () => {
  router.push({
    name: 'ReviewList',
    params: { targetType: 'instructor', targetId: instructorId.value },
  })
}

const getSpecialtyLabel = (value) => {
  return specialtyLabels[value] || value
}

const getDegreeLabel = (value) => {
  return degreeLabels[value] || value
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  })
}

onMounted(() => {
  fetchInstructor()
})
</script>

<style scoped>
.instructor-profile-page {
  padding: var(--spacing-lg);
}

.instructor-header {
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto var(--spacing-lg);
  overflow: hidden;
  background-color: var(--color-divider);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 64px;
}

.instructor-info {
  text-align: center;
}

.instructor-name {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.instructor-rating {
  margin-bottom: var(--spacing-md);
}

.rating-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
}

.review-count {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-left: var(--spacing-xs);
}

.specialties {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  justify-content: center;
}

.specialty-chip {
  font-size: 12px;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-sm);
}

.bio-section,
.specialties-section,
.experiences-section,
.educations-section,
.reviews-section {
  margin-bottom: var(--spacing-lg);
}

.bio-section h3,
.specialties-section h3,
.experiences-section h3,
.educations-section h3,
.reviews-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.bio-section p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-primary);
  white-space: pre-wrap;
}

.specialty-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.experience-item,
.education-item {
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-divider);
}

.experience-item:last-child,
.education-item:last-child {
  border-bottom: none;
}

.experience-header,
.education-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.institution,
.school {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.position,
.degree {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.experience-dates,
.education-dates {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.education-info {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.major {
  font-size: 14px;
  color: var(--color-text-primary);
}

.experience-description,
.education-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-top: var(--spacing-xs);
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.review-item {
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-divider);
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.review-rating {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
}

.review-author {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.review-date {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-left: auto;
}

.review-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-primary);
  margin: 0;
}

.view-all-reviews {
  margin-top: var(--spacing-lg);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>

