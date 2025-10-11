<template>
  <AcademyLayout>
    <div class="applicant-management">
      <!-- 공고 선택 -->
      <div class="applicant-management__filter">
        <label class="filter-label">공고 선택</label>
        <select v-model="selectedJobId" class="job-select" @change="handleJobChange">
          <option value="">전체 공고</option>
          <option v-for="job in activeJobs" :key="job.id" :value="job.id">
            {{ job.title }} ({{ job.applicantCount || 0 }}명)
          </option>
        </select>
      </div>

      <!-- 상태별 탭 -->
      <div class="applicant-management__tabs">
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

      <!-- 지원자 목록 -->
      <div v-if="!isLoading && filteredApplicants.length > 0" class="applicant-management__content">
        <div
          v-for="applicant in filteredApplicants"
          :key="applicant.id"
          class="applicant-card"
        >
          <BaseCard clickable @click="handleApplicantClick(applicant.id)">
            <!-- 새 지원 표시 -->
            <div v-if="applicant.status === 'applied'" class="applicant-card__new-badge"></div>

            <div class="applicant-card__header">
              <!-- 프로필 사진 -->
              <div class="profile-photo">
                <img v-if="applicant.profileImage" :src="applicant.profileImage" alt="프로필" />
                <UserIcon v-else :size="32" />
              </div>

              <!-- 기본 정보 -->
              <div class="applicant-info">
                <h4 class="name">
                  {{ applicant.name }}
                  <BaseBadge v-if="applicant.isVerified" variant="success" size="small">
                    ✓
                  </BaseBadge>
                </h4>
                <p class="genres">{{ applicant.genres.join(', ') }}</p>
              </div>
            </div>

            <!-- 경력 요약 -->
            <p v-if="applicant.careerSummary" class="applicant-card__career">
              {{ applicant.careerSummary }}
            </p>

            <!-- 지원일 & 상태 -->
            <div class="applicant-card__footer">
              <span class="date">{{ formatDate(applicant.appliedAt, 'YYYY.MM.DD') }}</span>
              <BaseBadge :variant="getStatusVariant(applicant.status)">
                {{ getStatusText(applicant.status) }}
              </BaseBadge>
            </div>
          </BaseCard>
        </div>
      </div>

      <!-- 로딩 -->
      <BaseLoading v-if="isLoading" type="skeleton" inline :lines="5" />

      <!-- 빈 상태 -->
      <BaseEmptyState
        v-if="!isLoading && filteredApplicants.length === 0"
        title="아직 지원자가 없습니다"
        description="공고를 등록하고 지원자를 기다려보세요"
      />
    </div>
  </AcademyLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  User as UserIcon,
  Music as MusicIcon,
  DollarSign as DollarSignIcon,
  Users as UsersIcon,
} from 'lucide-vue-next'
import { AcademyLayout } from '@/components/layout'
import { BaseCard, BaseBadge, BaseButton, BaseLoading, BaseEmptyState } from '@/components/common'
import { useJobStore, useApplicationStore } from '@/stores'
import { APPLICATION_STATUS, JOB_STATUS } from '@/utils/constants'
import { formatSalary, formatDate } from '@/utils/helpers'

const router = useRouter()
const jobStore = useJobStore()
const applicationStore = useApplicationStore()

const selectedJobId = ref('')
const activeTab = ref('all')
const isLoading = ref(false)

const tabs = [
  { value: 'all', label: '전체' },
  { value: APPLICATION_STATUS.APPLIED, label: '새 지원' },
  { value: APPLICATION_STATUS.REVIEWING, label: '검토중' },
  { value: APPLICATION_STATUS.ACCEPTED, label: '채용 확정' },
  { value: APPLICATION_STATUS.REJECTED, label: '불합격' },
]

const activeJobs = computed(() => {
  return jobStore.jobs.filter((job) => job.status === JOB_STATUS.ACTIVE)
})

const applicants = computed(() => applicationStore.applicants)

const filteredApplicants = computed(() => {
  if (activeTab.value === 'all') {
    return applicants.value
  }
  return applicationStore.applicantsByStatus(activeTab.value)
})

const getTabCount = (tabValue) => {
  if (tabValue === 'all') {
    return applicants.value.length
  }
  return applicationStore.applicantsByStatus(tabValue).length
}

const getStatusVariant = (status) => {
  const variants = {
    [APPLICATION_STATUS.APPLIED]: 'warning',
    [APPLICATION_STATUS.REVIEWING]: 'info',
    [APPLICATION_STATUS.ACCEPTED]: 'success',
    [APPLICATION_STATUS.REJECTED]: 'error',
  }
  return variants[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    [APPLICATION_STATUS.APPLIED]: '새 지원',
    [APPLICATION_STATUS.REVIEWING]: '검토중',
    [APPLICATION_STATUS.ACCEPTED]: '채용 확정',
    [APPLICATION_STATUS.REJECTED]: '불합격',
  }
  return texts[status] || status
}

const handleJobChange = async () => {
  isLoading.value = true
  await applicationStore.fetchApplicants(selectedJobId.value || null)
  isLoading.value = false
}

const handleApplicantClick = (applicantId) => {
  router.push(`/academy/applicants/${applicantId}`)
}

onMounted(async () => {
  isLoading.value = true
  await Promise.all([jobStore.fetchJobs(), applicationStore.fetchApplicants()])
  isLoading.value = false
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.applicant-management {
  &__filter {
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;

    .filter-label {
      display: block;
      font-size: $font-size-body-small;
      font-weight: $font-weight-medium;
      color: $color-text-secondary;
      margin-bottom: $spacing-sm;
    }

    .job-select {
      width: 100%;
      height: $input-height;
      padding: 0 $input-padding-x;
      border: 1px solid $color-divider;
      border-radius: $radius-md;
      background-color: $color-white;
      font-size: $font-size-body;
      color: $color-text-primary;
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: $color-primary;
        border-width: 2px;
      }
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

.applicant-card {
  position: relative;

  &__new-badge {
    position: absolute;
    top: $spacing-lg;
    left: $spacing-md;
    width: 8px;
    height: 8px;
    background-color: $color-accent;
    border-radius: 50%;
    z-index: 1;
  }

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

  .applicant-info {
    flex: 1;

    .name {
      font-size: $font-size-body;
      font-weight: $font-weight-semibold;
      margin: 0 0 $spacing-xs 0;
      display: flex;
      align-items: center;
      gap: $spacing-xs;
    }

    .genres {
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      margin: 0;
    }
  }

  &__career {
    font-size: $font-size-body-small;
    color: $color-text-primary;
    margin: 0 0 $spacing-md 0;
    @include text-ellipsis(2);
  }

  &__footer {
    @include flex-between;
    padding-top: $spacing-md;
    border-top: 1px solid $color-divider;

    .date {
      font-size: $font-size-caption;
      color: $color-text-secondary;
    }
  }
}
</style>

