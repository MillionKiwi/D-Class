<template>
  <AcademyLayout>
    <div class="review-write">
      <!-- 헤더 -->
      <div class="review-write__header">
        <button class="back-button" @click="handleBack">
          <ArrowLeftIcon :size="24" />
        </button>
        <h1>리뷰 작성</h1>
        <BaseButton variant="text" :disabled="!canSubmit" @click="handleSubmit">완료</BaseButton>
      </div>

      <!-- 강사 정보 요약 -->
      <section class="review-write__section">
        <div class="instructor-summary">
          <div class="instructor-summary__icon">
            <UserIcon :size="32" />
          </div>
          <div class="instructor-summary__info">
            <h3>{{ instructorName }}</h3>
            <p v-if="workPeriod">근무 기간: {{ workPeriod }}</p>
          </div>
        </div>
      </section>

      <!-- 평점 선택 -->
      <section class="review-write__section">
        <h3 class="section-title">
          평점을 선택해주세요 <span class="required">*</span>
        </h3>
        <div class="rating-selector">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="star-button"
            @click="selectedRating = star"
          >
            <StarIcon
              :size="48"
              :fill="star <= selectedRating ? 'currentColor' : 'none'"
              :class="{ selected: star <= selectedRating }"
            />
          </button>
        </div>
        <p v-if="selectedRating" class="rating-text">{{ getRatingText(selectedRating) }}</p>
      </section>

      <!-- 리뷰 내용 -->
      <section class="review-write__section">
        <h3 class="section-title">
          리뷰를 작성해주세요 <span class="required">*</span>
        </h3>
        <BaseInput
          v-model="reviewContent"
          textarea
          placeholder="솔직하고 객관적인 리뷰를 부탁드립니다&#10;&#10;- 강사의 전문성&#10;- 수업 진행 능력&#10;- 성실도&#10;- 기타 특이사항"
          :rows="10"
          :minlength="10"
          :maxlength="500"
          :showCounter="true"
          :error="!!error"
          :errorMessage="error"
        />
        <p class="guide-text">
          <AlertCircleIcon :size="16" />
          솔직하고 객관적인 리뷰를 부탁드립니다
        </p>
      </section>

      <!-- 작성 취소 확인 모달 -->
      <BaseModal
        v-model:isOpen="showConfirmModal"
        title="작성 중인 리뷰"
        confirmText="나가기"
        cancelText="계속 작성"
        @confirm="confirmLeave"
        @cancel="showConfirmModal = false"
      >
        <p>작성 중인 리뷰가 있습니다.</p>
        <p>정말 나가시겠습니까?</p>
      </BaseModal>
    </div>
  </AcademyLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft as ArrowLeftIcon,
  User as UserIcon,
  Star as StarIcon,
  AlertCircle as AlertCircleIcon,
} from 'lucide-vue-next'
import { AcademyLayout } from '@/components/layout'
import { BaseButton, BaseInput, BaseModal } from '@/components/common'
import { useToast } from '@/composables/useToast'
import { apiClient } from '@/api'

const route = useRoute()
const router = useRouter()
const { success, error: showError } = useToast()

const instructorName = ref('')
const workPeriod = ref('')
const selectedRating = ref(0)
const reviewContent = ref('')
const error = ref('')
const showConfirmModal = ref(false)
const isSubmitting = ref(false)

const canSubmit = computed(() => {
  return selectedRating.value > 0 && reviewContent.value.trim().length >= 10
})

const hasContent = computed(() => {
  return selectedRating.value > 0 || reviewContent.value.trim().length > 0
})

const getRatingText = (rating) => {
  const texts = {
    1: '매우 불만족',
    2: '불만족',
    3: '보통',
    4: '만족',
    5: '매우 만족',
  }
  return texts[rating] || ''
}

const handleSubmit = async () => {
  if (!canSubmit.value) {
    if (selectedRating.value === 0) {
      showError('평점을 선택해주세요')
      return
    }
    if (reviewContent.value.trim().length < 10) {
      error.value = '최소 10자 이상 입력해주세요'
      return
    }
    return
  }

  isSubmitting.value = true
  try {
    await apiClient.post('/reviews', {
      instructorId: route.params.instructorId,
      rating: selectedRating.value,
      content: reviewContent.value.trim(),
    })

    success('리뷰가 등록되었습니다.')
    router.push('/academy/profile')
  } catch (err) {
    showError(err.response?.data?.message || '리뷰 등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

const handleBack = () => {
  if (hasContent.value) {
    showConfirmModal.value = true
  } else {
    router.back()
  }
}

const confirmLeave = () => {
  router.back()
}

onMounted(async () => {
  try {
    // 강사 정보 가져오기
    const response = await apiClient.get(`/instructors/${route.params.instructorId}/basic`)
    instructorName.value = response.data.name
    workPeriod.value = response.data.workPeriod || ''
  } catch (err) {
    console.error('Failed to load instructor info:', err)
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.review-write {
  &__header {
    @include flex-between;
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;
    position: sticky;
    top: $header-height;
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
    }
  }

  &__section {
    background-color: $color-white;
    padding: $spacing-xl;
    margin-bottom: $spacing-md;
    border-bottom: 8px solid $color-background;
  }
}

.instructor-summary {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  padding: $spacing-lg;
  background-color: $color-background;
  border-radius: $radius-lg;

  &__icon {
    @include flex-center;
    width: 56px;
    height: 56px;
    background-color: rgba($color-primary, 0.1);
    border-radius: $radius-md;
    color: $color-primary;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;

    h3 {
      font-size: $font-size-h3;
      font-weight: $font-weight-semibold;
      margin: 0 0 $spacing-xs 0;
    }

    p {
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      margin: 0;
    }
  }
}

.section-title {
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  margin: 0 0 $spacing-lg 0;
  color: $color-text-primary;

  .required {
    color: $color-error;
  }
}

.rating-selector {
  display: flex;
  justify-content: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;

  .star-button {
    background: none;
    border: none;
    color: $color-disabled;
    cursor: pointer;
    padding: $spacing-xs;
    transition: all $transition-fast;

    &:hover {
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }

    svg {
      transition: color $transition-fast;

      &.selected {
        color: $color-accent;
      }
    }
  }
}

.rating-text {
  text-align: center;
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  color: $color-primary;
  margin: 0;
}

.guide-text {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-body-small;
  color: $color-text-secondary;
  margin-top: $spacing-md;

  svg {
    color: $color-info;
    flex-shrink: 0;
  }
}
</style>

