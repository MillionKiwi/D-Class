<template>
  <AppLayout>
    <div v-if="loading && !academy" class="loading-container">
      <LoadingSpinner />
    </div>

    <div v-else-if="academy" class="academy-profile-page page-container">
      <!-- 학원 기본 정보 -->
      <div class="academy-header card">
        <img
          v-if="academy.academy_image"
          :src="academy.academy_image"
          alt="학원 이미지"
          class="academy-image"
        />
        <div class="academy-info">
          <h2 class="academy-name">
            {{ academy.academy_name }}
            <Badge v-if="academy.is_verified" variant="success" small>✓</Badge>
          </h2>
          <div class="academy-rating">
            <span class="rating-value">⭐ {{ academy.average_rating || 'N/A' }}</span>
            <span class="review-count">({{ academy.review_count || 0 }}개 리뷰)</span>
          </div>
          <p class="academy-address">📍 {{ academy.address }}</p>
          <p v-if="academy.phone" class="academy-phone">📞 {{ academy.phone }}</p>
          <p v-if="academy.operating_hours" class="academy-hours">🕐 {{ academy.operating_hours }}</p>
          <Button variant="secondary" @click="viewLocation">위치 보기</Button>
        </div>
      </div>

      <!-- 학원 소개 -->
      <div v-if="academy.description" class="academy-description card">
        <h3>학원 소개</h3>
        <p>{{ academy.description }}</p>
      </div>

      <!-- 주요 장르 -->
      <div v-if="academy.main_genres && academy.main_genres.length > 0" class="academy-genres card">
        <h3>주요 장르</h3>
        <div class="genre-chips">
          <span v-for="genre in academy.main_genres" :key="genre" class="genre-chip">
            {{ getGenreLabel(genre) }}
          </span>
        </div>
      </div>

      <!-- 편의시설 -->
      <div v-if="academy.facilities && academy.facilities.length > 0" class="academy-facilities card">
        <h3>편의시설</h3>
        <div class="facilities-list">
          <span v-for="facility in academy.facilities" :key="facility" class="facility-item">
            {{ getFacilityLabel(facility) }}
          </span>
        </div>
      </div>

      <!-- 등록된 공고 -->
      <div v-if="academy.job_postings && academy.job_postings.length > 0" class="academy-postings card">
        <h3>등록된 공고</h3>
        <div class="postings-list">
          <Card
            v-for="posting in academy.job_postings"
            :key="posting.id"
            class="posting-card"
            clickable
            @click="$router.push(`/job-postings/${posting.id}`)"
          >
            <h4>{{ posting.title }}</h4>
            <p class="posting-genres">{{ formatGenres(posting.genres) }}</p>
            <p class="posting-salary">{{ formatSalary(posting) }}</p>
          </Card>
        </div>
      </div>

      <!-- 리뷰 섹션 -->
      <div class="reviews-section card">
        <div class="section-header">
          <h3>리뷰</h3>
          <Button variant="text" @click="viewAllReviews">전체 리뷰 보기</Button>
        </div>
        <div v-if="reviews && reviews.length > 0" class="reviews-preview">
          <Card
            v-for="review in reviews.slice(0, 3)"
            :key="review.id"
            class="review-card"
          >
            <div class="review-header">
              <span class="review-author">{{ review.author }}</span>
              <div class="review-rating">
                <span v-for="star in 5" :key="star" :class="{ active: star <= review.rating }">
                  ⭐
                </span>
              </div>
            </div>
            <p class="review-content">{{ review.content }}</p>
            <span class="review-date">{{ formatDate(review.created_at) }}</span>
          </Card>
        </div>
        <div v-else class="empty-reviews">
          <p>아직 작성된 리뷰가 없습니다</p>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>학원 정보를 찾을 수 없습니다</p>
      <Button @click="$router.back()">돌아가기</Button>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'
import { useReviewStore } from '@/stores/review'
import { inject } from 'vue'
import { formatGenres, getGenreLabel } from '@/utils/formatters'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const reviewStore = useReviewStore()
const showToast = inject('toast', () => {})

const academyId = computed(() => route.params.id)
const academy = ref(null)
const reviews = ref([])
const loading = ref(false)

const facilityLabels = {
  parking: '주차 가능',
  shower: '샤워실',
  locker: '락커',
  mirror: '전신 거울',
  sound: '음향 시설',
}

const fetchAcademy = async () => {
  loading.value = true
  try {
    const response = await apiClient.get(API_ENDPOINTS.ACADEMIES.DETAIL(academyId.value))
    academy.value = response.data

    // 리뷰 미리보기 로드
    const reviewResult = await reviewStore.fetchAcademyReviews(academyId.value, {
      page_size: 3,
    })
    if (reviewResult.success) {
      // API 응답 구조: { count, next, previous, results: { academy, rating_distribution, count, results: [...] } }
      if (reviewResult.data.results && typeof reviewResult.data.results === 'object' && !Array.isArray(reviewResult.data.results)) {
        // Pagination이 적용된 경우
        reviews.value = reviewResult.data.results.results || []
      } else {
        // Pagination이 적용되지 않은 경우
      reviews.value = reviewResult.data.results || []
      }
    }
  } catch (error) {
    showToast('학원 정보를 불러오는데 실패했습니다', 'error')
  } finally {
    loading.value = false
  }
}

const viewAllReviews = () => {
  router.push({
    name: 'ReviewList',
    params: { targetType: 'academy', targetId: academyId.value },
  })
}

const viewLocation = () => {
  if (academy.value?.address) {
    // 카카오맵 또는 네이버맵으로 이동
    const url = `https://map.kakao.com/link/search/${encodeURIComponent(academy.value.address)}`
    window.open(url, '_blank')
  }
}

const getFacilityLabel = (value) => {
  return facilityLabels[value] || value
}

const formatSalary = (posting) => {
  if (posting.salary_type === 'hourly') {
    return `${posting.salary.toLocaleString()}원/시간`
  } else {
    return `${posting.salary.toLocaleString()}원/월`
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

onMounted(() => {
  fetchAcademy()
})
</script>

<style scoped>
.academy-profile-page {
  padding: var(--spacing-lg);
}

.academy-header {
  margin-bottom: var(--spacing-lg);
}

.academy-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.academy-info {
  text-align: center;
}

.academy-name {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.academy-rating {
  margin-bottom: var(--spacing-md);
  font-size: 18px;
}

.rating-value {
  font-weight: 700;
}

.review-count {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.academy-address,
.academy-phone,
.academy-hours {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.academy-description,
.academy-genres,
.academy-facilities,
.academy-postings,
.reviews-section {
  margin-bottom: var(--spacing-lg);
}

.academy-description h3,
.academy-genres h3,
.academy-facilities h3,
.academy-postings h3,
.reviews-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-divider);
}

.academy-description p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-primary);
  white-space: pre-wrap;
}

.genre-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.genre-chip {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-full);
  font-size: 14px;
}

.facilities-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.facility-item {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--radius-sm);
  font-size: 14px;
}

.postings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.posting-card {
  padding: var(--spacing-md);
}

.posting-card h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.posting-genres {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.posting-salary {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-accent);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.reviews-preview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.review-card {
  padding: var(--spacing-md);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.review-author {
  font-size: 14px;
  font-weight: 600;
}

.review-rating {
  display: flex;
  gap: 2px;
}

.review-rating span {
  font-size: 12px;
  opacity: 0.3;
}

.review-rating span.active {
  opacity: 1;
}

.review-content {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.review-date {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.empty-reviews {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
