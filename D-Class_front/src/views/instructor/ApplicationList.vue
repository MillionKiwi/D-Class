<template>
  <InstructorLayout>
    <div class="application-list">
      <!-- 헤더 -->
      <div class="application-list__header">
        <h1>지원 현황</h1>
      </div>

      <!-- 상태별 탭 -->
      <div class="application-list__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span v-if="getTabCount(tab.value) > 0" class="tab__badge">
            {{ getTabCount(tab.value) }}
          </span>
        </button>
      </div>

      <!-- 공고 카드 목록 -->
      <div v-if="!isLoading && filteredApplications.length > 0" class="application-list__content">
        <div v-for="application in filteredApplications" :key="application.id" class="application-card">
          <BaseCard clickable @click="handleCardClick(application.jobId)">
            <!-- 학원 정보 -->
            <div class="application-card__academy">
              <h3 class="academy-name">
                {{ application.academyName }}
                <BaseBadge v-if="application.isVerified" variant="success" size="small">
                  ✓
                </BaseBadge>
              </h3>
            </div>

            <!-- 공고 제목 -->
            <h4 class="application-card__title">{{ application.jobTitle }}</h4>

            <!-- 지원일 -->
            <div class="application-card__date">
              <CalendarIcon :size="14" />
              <span>지원일: {{ formatDate(application.appliedAt, 'YYYY.MM.DD') }}</span>
            </div>

            <!-- 상태 배지 -->
            <div class="application-card__status">
              <BaseBadge :variant="getStatusVariant(application.status)">
                {{ getStatusText(application.status) }}
              </BaseBadge>
            </div>

            <!-- 최종 합격 시 리뷰 작성 버튼 -->
            <div
              v-if="application.status === 'accepted' && !application.hasReview"
              class="application-card__action"
            >
              <BaseButton block @click.stop="handleWriteReview(application.academyId)">
                리뷰 작성하기
              </BaseButton>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- 로딩 -->
      <BaseLoading v-if="isLoading" type="skeleton" inline :lines="5" />

      <!-- 빈 상태 -->
      <BaseEmptyState
        v-if="!isLoading && filteredApplications.length === 0"
        title="아직 지원한 공고가 없습니다"
        description="관심 있는 공고에 지원해보세요"
      >
        <template #action>
          <BaseButton @click="$router.push('/instructor/jobs')">공고 둘러보기</BaseButton>
        </template>
      </BaseEmptyState>
    </div>
  </InstructorLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  FileText as FileTextIcon,
  Calendar as CalendarIcon,
  ChevronRight as ChevronRightIcon,
} from 'lucide-vue-next'
import { InstructorLayout } from '@/components/layout'
import { BaseCard, BaseBadge, BaseButton, BaseLoading, BaseEmptyState } from '@/components/common'
import { useApplicationStore } from '@/stores'
import { APPLICATION_STATUS } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'

const router = useRouter()
const applicationStore = useApplicationStore()

const activeTab = ref('all')
const isLoading = ref(false)

const tabs = [
  { value: 'all', label: '전체' },
  { value: APPLICATION_STATUS.REVIEWING, label: '검토중' },
  { value: APPLICATION_STATUS.ACCEPTED, label: '최종합격' },
  { value: APPLICATION_STATUS.REJECTED, label: '불합격' },
]

const applications = computed(() => applicationStore.applications)

const filteredApplications = computed(() => {
  if (activeTab.value === 'all') {
    return applications.value
  }
  return applicationStore.applicationsByStatus(activeTab.value)
})

const getTabCount = (tabValue) => {
  if (tabValue === 'all') {
    return applications.value.length
  }
  return applicationStore.applicationsByStatus(tabValue).length
}

const getStatusVariant = (status) => {
  const variants = {
    [APPLICATION_STATUS.APPLIED]: 'info',
    [APPLICATION_STATUS.REVIEWING]: 'warning',
    [APPLICATION_STATUS.ACCEPTED]: 'success',
    [APPLICATION_STATUS.REJECTED]: 'error',
  }
  return variants[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    [APPLICATION_STATUS.APPLIED]: '지원 완료',
    [APPLICATION_STATUS.REVIEWING]: '검토중',
    [APPLICATION_STATUS.ACCEPTED]: '최종합격',
    [APPLICATION_STATUS.REJECTED]: '불합격',
  }
  return texts[status] || status
}

const handleCardClick = (jobId) => {
  router.push(`/instructor/jobs/${jobId}`)
}

const handleWriteReview = (academyId) => {
  router.push(`/instructor/reviews/write/${academyId}`)
}

onMounted(async () => {
  isLoading.value = true
  await applicationStore.fetchMyApplications()
  isLoading.value = false
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.application-list {
  &__header {
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;

    h1 {
      font-size: $font-size-h2;
      font-weight: $font-weight-semibold;
      margin: 0;
    }
  }

  &__tabs {
    display: flex;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;
    overflow-x: auto;
    @include custom-scrollbar;

    .tab {
      flex: 1;
      min-width: fit-content;
      padding: $spacing-lg;
      background: none;
      border: none;
      font-size: $font-size-body;
      color: $color-text-secondary;
      cursor: pointer;
      position: relative;
      transition: all $transition-fast;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $spacing-sm;

      &:hover {
        color: $color-primary;
        background-color: rgba($color-primary, 0.02);
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
          height: 3px;
          background-color: $color-primary;
        }
      }

      &__badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 $spacing-xs;
        background-color: $color-accent;
        color: $color-white;
        border-radius: $radius-full;
        font-size: $font-size-caption;
        font-weight: $font-weight-semibold;
      }
    }
  }

  &__content {
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
}

.application-card {
  &__academy {
    margin-bottom: $spacing-sm;
  }

  .academy-name {
    font-size: $font-size-body;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
    margin: 0;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  &__title {
    font-size: $font-size-h3;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
    margin: 0 0 $spacing-md 0;
  }

  &__date {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-body-small;
    color: $color-text-secondary;
    margin-bottom: $spacing-md;
  }

  &__status {
    padding-top: $spacing-md;
    border-top: 1px solid $color-divider;
  }

  &__action {
    margin-top: $spacing-lg;
  }
}
</style>

