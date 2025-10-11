<template>
  <AcademyLayout>
    <div class="hired-list">
      <!-- 헤더 -->
      <div class="hired-list__header">
        <button class="back-button" @click="$router.back()">
          <ArrowLeftIcon :size="24" />
        </button>
        <h1>채용 현황</h1>
        <div style="width: 44px"></div>
      </div>

      <!-- 채용된 강사 목록 -->
      <div v-if="!isLoading && hiredList.length > 0" class="hired-list__content">
        <div v-for="instructor in hiredList" :key="instructor.id" class="instructor-card">
          <BaseCard clickable @click="handleCardClick(instructor)">
            <div class="instructor-card__header">
              <!-- 프로필 사진 -->
              <div class="profile-photo">
                <img
                  v-if="instructor.profileImage"
                  :src="instructor.profileImage"
                  alt="프로필"
                />
                <UserIcon v-else :size="32" />
              </div>

              <!-- 기본 정보 -->
              <div class="instructor-info">
                <h4 class="name">
                  {{ instructor.name }}
                  <BaseBadge v-if="instructor.isVerified" variant="success" size="small">
                    ✓
                  </BaseBadge>
                </h4>
                <p class="job-title">{{ instructor.jobTitle }}</p>
              </div>
            </div>

            <!-- 담당 공고/수업 -->
            <div class="instructor-card__details">
              <div class="detail-item">
                <span class="label">담당 수업</span>
                <span class="value">{{ instructor.classes }}</span>
              </div>
              <div class="detail-item">
                <span class="label">채용 확정일</span>
                <span class="value">{{ formatDate(instructor.hiredAt, 'YYYY.MM.DD') }}</span>
              </div>
            </div>

            <!-- 리뷰 작성 버튼 -->
            <div v-if="!instructor.hasReview" class="instructor-card__action">
              <BaseButton block @click.stop="handleWriteReview(instructor.id)">
                <StarIcon :size="20" />
                리뷰 작성하기
              </BaseButton>
            </div>
            <div v-else class="instructor-card__reviewed">
              <CheckCircleIcon :size="16" />
              <span>리뷰 작성 완료</span>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- 로딩 -->
      <BaseLoading v-if="isLoading" type="skeleton" inline :lines="5" />

      <!-- 빈 상태 -->
      <BaseEmptyState
        v-if="!isLoading && hiredList.length === 0"
        title="아직 채용 확정된 강사가 없습니다"
        description="지원자를 검토하고 채용을 확정해보세요"
      >
        <template #action>
          <BaseButton @click="$router.push('/academy/applicants')">지원자 관리</BaseButton>
        </template>
      </BaseEmptyState>
    </div>
  </AcademyLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft as ArrowLeftIcon,
  User as UserIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
} from 'lucide-vue-next'
import { AcademyLayout } from '@/components/layout'
import { BaseCard, BaseBadge, BaseButton, BaseLoading, BaseEmptyState } from '@/components/common'
import { useApplicationStore } from '@/stores'
import { formatDate } from '@/utils/helpers'

const router = useRouter()
const applicationStore = useApplicationStore()

const hiredList = ref([])
const isLoading = ref(false)

const handleCardClick = (instructor) => {
  router.push(`/academy/applicants/${instructor.applicationId}`)
}

const handleWriteReview = (instructorId) => {
  router.push(`/academy/reviews/write/${instructorId}`)
}

onMounted(async () => {
  isLoading.value = true
  const result = await applicationStore.fetchHiredList()
  if (result.success) {
    hiredList.value = result.data
  }
  isLoading.value = false
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.hired-list {
  &__header {
    @include flex-between;
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;

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
    }
  }

  &__content {
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
}

.instructor-card {
  &__header {
    display: flex;
    gap: $spacing-md;
    margin-bottom: $spacing-md;
  }

  .profile-photo {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: $color-background;
    @include flex-center;
    color: $color-text-secondary;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .instructor-info {
    flex: 1;

    .name {
      font-size: $font-size-body;
      font-weight: $font-weight-semibold;
      margin: 0 0 $spacing-xs 0;
      display: flex;
      align-items: center;
      gap: $spacing-xs;
    }

    .job-title {
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      margin: 0;
    }
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding: $spacing-md 0;
    margin-bottom: $spacing-md;
    border-top: 1px solid $color-divider;
    border-bottom: 1px solid $color-divider;

    .detail-item {
      display: flex;
      justify-content: space-between;

      .label {
        font-size: $font-size-body-small;
        color: $color-text-secondary;
      }

      .value {
        font-size: $font-size-body-small;
        font-weight: $font-weight-medium;
        color: $color-text-primary;
      }
    }
  }

  &__action {
    margin-top: $spacing-md;
  }

  &__reviewed {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-md;
    background-color: rgba($color-success, 0.1);
    border-radius: $radius-md;
    color: $color-success;
    font-size: $font-size-body-small;
    font-weight: $font-weight-medium;
  }
}
</style>

