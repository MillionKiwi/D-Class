<template>
  <div class="academy-profile">
    <!-- 헤더 -->
    <div class="academy-profile__header">
      <button class="back-button" @click="$router.back()">
        <ArrowLeftIcon :size="24" />
      </button>
      <h1>{{ academy?.name || '학원 프로필' }}</h1>
      <div style="width: 44px"></div>
    </div>

    <!-- 로딩 -->
    <div v-if="isLoading" class="academy-profile__loading">
      <BaseLoading type="skeleton" inline :lines="10" />
    </div>

    <!-- 학원 정보 -->
    <div v-else-if="academy" class="academy-profile__content">
      <!-- 학원 기본 정보 -->
      <section class="academy-profile__section">
        <div v-if="academy.image" class="academy-image">
          <img :src="academy.image" alt="학원 대표 이미지" />
        </div>

        <div class="academy-info">
          <h2 class="academy-name">
            {{ academy.name }}
            <BaseBadge v-if="academy.isVerified" variant="success">인증</BaseBadge>
          </h2>

          <div class="rating-section">
            <div class="rating">
              <StarIcon :size="24" fill="currentColor" />
              <span class="rating-score">{{ academy.rating?.toFixed(1) || '0.0' }}</span>
            </div>
            <span class="review-count">{{ academy.reviewCount || 0 }}개 리뷰</span>
          </div>

          <div class="contact-info">
            <div class="info-row">
              <MapPinIcon :size="16" />
              <span>{{ academy.address }}</span>
            </div>
            <div class="info-row">
              <PhoneIcon :size="16" />
              <span>{{ academy.phone }}</span>
            </div>
            <div v-if="academy.email" class="info-row">
              <MailIcon :size="16" />
              <span>{{ academy.email }}</span>
            </div>
          </div>

          <BaseButton block @click="showMap">
            <MapIcon :size="20" />
            위치 보기
          </BaseButton>
        </div>
      </section>

      <!-- 학원 소개 -->
      <section v-if="academy.description" class="academy-profile__section">
        <h3 class="section-title">학원 소개</h3>
        <p class="description">{{ academy.description }}</p>
      </section>

      <!-- 운영 정보 -->
      <section v-if="academy.operatingHours || academy.genres || academy.facilities" class="academy-profile__section">
        <h3 class="section-title">운영 정보</h3>
        
        <div class="info-grid">
          <div v-if="academy.operatingHours" class="info-item">
            <span class="label">운영 시간</span>
            <span class="value">{{ academy.operatingHours }}</span>
          </div>

          <div v-if="academy.genres && academy.genres.length > 0" class="info-item">
            <span class="label">주요 장르</span>
            <div class="genre-tags">
              <BaseBadge v-for="genre in academy.genres" :key="genre" variant="primary">
                {{ genre }}
              </BaseBadge>
            </div>
          </div>

          <div v-if="academy.facilities && academy.facilities.length > 0" class="info-item">
            <span class="label">편의시설</span>
            <div class="facility-tags">
              <span v-for="facility in academy.facilities" :key="facility" class="facility-tag">
                {{ getFacilityLabel(facility) }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 등록된 공고 -->
      <section v-if="academyJobs.length > 0" class="academy-profile__section">
        <h3 class="section-title">등록된 공고 ({{ academyJobs.length }})</h3>
        <div class="jobs-list">
          <JobCard v-for="job in academyJobs" :key="job.id" :job="job" />
        </div>
      </section>

      <!-- 리뷰 섹션 -->
      <section class="academy-profile__section">
        <div class="section-header">
          <h3 class="section-title">리뷰</h3>
          <button v-if="reviews.length > 3" class="view-all" @click="viewAllReviews">
            전체 보기
          </button>
        </div>

        <!-- 평점 분포 -->
        <div v-if="academy.ratingDistribution" class="rating-distribution">
          <div
            v-for="(count, rating) in academy.ratingDistribution"
            :key="rating"
            class="rating-bar"
          >
            <span class="rating-label">{{ rating }}점</span>
            <div class="bar-container">
              <div class="bar-fill" :style="{ width: getRatingPercentage(count) + '%' }"></div>
            </div>
            <span class="rating-count">{{ count }}</span>
          </div>
        </div>

        <!-- 리뷰 목록 (최신 3개) -->
        <div v-if="reviews.length > 0" class="review-list">
          <div v-for="review in displayedReviews" :key="review.id" class="review-card">
            <div class="review-header">
              <span class="reviewer-name">{{ review.reviewerName }}</span>
              <div class="review-rating">
                <StarIcon :size="14" fill="currentColor" />
                <span>{{ review.rating }}</span>
              </div>
            </div>
            <p class="review-content">{{ review.content }}</p>
            <span class="review-date">{{ formatDate(review.createdAt, 'YYYY.MM.DD') }}</span>
          </div>
        </div>

        <BaseEmptyState
          v-else
          title="아직 작성된 리뷰가 없습니다"
          description="첫 번째 리뷰를 작성해보세요"
        />
      </section>
    </div>

    <!-- 에러 상태 -->
    <BaseEmptyState
      v-else
      title="학원 정보를 찾을 수 없습니다"
      description="삭제되었거나 존재하지 않는 학원입니다"
    >
      <template #action>
        <BaseButton @click="$router.back()">돌아가기</BaseButton>
      </template>
    </BaseEmptyState>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft as ArrowLeftIcon,
  Star as StarIcon,
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Map as MapIcon,
} from 'lucide-vue-next'
import { BaseButton, BaseBadge, BaseLoading, BaseEmptyState } from '@/components/common'
import JobCard from '@/components/common/JobCard.vue'
import { formatDate } from '@/utils/helpers'
import { useToast } from '@/composables/useToast'
import { apiClient } from '@/api'

const route = useRoute()
const router = useRouter()
const { info } = useToast()

const academy = ref(null)
const academyJobs = ref([])
const reviews = ref([])
const isLoading = ref(false)

const displayedReviews = computed(() => reviews.value.slice(0, 3))

const totalReviews = computed(() => {
  return Object.values(academy.value?.ratingDistribution || {}).reduce((a, b) => a + b, 0)
})

const getRatingPercentage = (count) => {
  if (!totalReviews.value) return 0
  return (count / totalReviews.value) * 100
}

const getFacilityLabel = (facility) => {
  const labels = {
    parking: '주차',
    shower: '샤워실',
    locker: '락커',
    wifi: 'WiFi',
  }
  return labels[facility] || facility
}

const showMap = () => {
  info('지도 보기 기능은 준비 중입니다.')
  // TODO: 지도 모달 또는 지도 앱 연동
}

const viewAllReviews = () => {
  router.push(`/academy/${route.params.id}/reviews`)
}

onMounted(async () => {
  isLoading.value = true
  try {
    // 학원 정보 조회
    const academyResponse = await apiClient.get(`/academies/${route.params.id}`)
    academy.value = academyResponse.data

    // 학원의 공고 목록
    const jobsResponse = await apiClient.get(`/academies/${route.params.id}/jobs`)
    academyJobs.value = jobsResponse.data

    // 학원 리뷰
    const reviewsResponse = await apiClient.get(`/academies/${route.params.id}/reviews`, {
      params: { limit: 3 },
    })
    reviews.value = reviewsResponse.data
  } catch (err) {
    console.error('Failed to load academy profile:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.academy-profile {
  min-height: 100vh;
  background-color: $color-background;

  &__header {
    @include flex-between;
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;
    position: sticky;
    top: 0;
    z-index: $z-index-sticky;

    .back-button {
      @include touch-target;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: $color-text-primary;
      cursor: pointer;
    }

    h1 {
      flex: 1;
      text-align: center;
      font-size: $font-size-h3;
      margin: 0;
      @include text-ellipsis(1);
    }
  }

  &__loading {
    padding: $spacing-xl;
  }

  &__content {
    padding: $spacing-lg;
  }

  &__section {
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;
    padding: $spacing-xl;
    margin-bottom: $spacing-lg;
  }
}

.academy-image {
  width: 100%;
  height: 200px;
  border-radius: $radius-lg;
  overflow: hidden;
  margin-bottom: $spacing-xl;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.academy-info {
  .academy-name {
    font-size: $font-size-h2;
    font-weight: $font-weight-bold;
    margin: 0 0 $spacing-lg 0;
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    flex-wrap: wrap;
  }
}

.rating-section {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;

  .rating {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    color: $color-warning;

    .rating-score {
      font-size: $font-size-h1;
      font-weight: $font-weight-bold;
      color: $color-text-primary;
    }
  }

  .review-count {
    font-size: $font-size-body;
    color: $color-text-secondary;
  }
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;
  padding: $spacing-lg;
  background-color: $color-background;
  border-radius: $radius-md;

  .info-row {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-body-small;
    color: $color-text-primary;

    svg {
      color: $color-primary;
      flex-shrink: 0;
    }
  }
}

.section-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  margin: 0 0 $spacing-lg 0;
  padding-bottom: $spacing-sm;
  border-bottom: 2px solid $color-divider;
}

.section-header {
  @include flex-between;
  margin-bottom: $spacing-lg;

  .section-title {
    margin: 0;
    border: none;
    padding: 0;
  }

  .view-all {
    background: none;
    border: none;
    color: $color-primary;
    font-size: $font-size-body-small;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

.description {
  font-size: $font-size-body;
  color: $color-text-primary;
  line-height: $line-height-relaxed;
  white-space: pre-line;
  margin: 0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.info-item {
  .label {
    display: block;
    font-size: $font-size-body-small;
    font-weight: $font-weight-semibold;
    color: $color-text-secondary;
    margin-bottom: $spacing-sm;
  }

  .value {
    font-size: $font-size-body;
    color: $color-text-primary;
  }
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.facility-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;

  .facility-tag {
    padding: $spacing-xs $spacing-md;
    background-color: $color-background;
    border-radius: $radius-md;
    font-size: $font-size-body-small;
    color: $color-text-primary;
  }
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-bottom: $spacing-2xl;
  padding: $spacing-lg;
  background-color: $color-background;
  border-radius: $radius-md;

  .rating-bar {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    .rating-label {
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      width: 40px;
    }

    .bar-container {
      flex: 1;
      height: 8px;
      background-color: $color-divider;
      border-radius: $radius-full;
      overflow: hidden;

      .bar-fill {
        height: 100%;
        background-color: $color-warning;
        border-radius: $radius-full;
        transition: width $transition-slow;
      }
    }

    .rating-count {
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      width: 40px;
      text-align: right;
    }
  }
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.review-card {
  padding: $spacing-lg;
  background-color: $color-background;
  border-radius: $radius-md;

  .review-header {
    @include flex-between;
    margin-bottom: $spacing-sm;

    .reviewer-name {
      font-size: $font-size-body-small;
      font-weight: $font-weight-semibold;
      color: $color-text-primary;
    }

    .review-rating {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      color: $color-warning;
      font-size: $font-size-body-small;
      font-weight: $font-weight-semibold;

      span {
        color: $color-text-primary;
      }
    }
  }

  .review-content {
    font-size: $font-size-body-small;
    color: $color-text-primary;
    line-height: $line-height-relaxed;
    margin: 0 0 $spacing-sm 0;
  }

  .review-date {
    font-size: $font-size-caption;
    color: $color-text-secondary;
  }
}
</style>

