<template>
  <InstructorLayout>
    <div v-if="isLoading" class="job-detail">
      <BaseLoading type="skeleton" inline :lines="10" />
    </div>

    <div v-else-if="job" class="job-detail">
      <!-- 학원 정보 섹션 -->
      <section class="job-detail__section">
        <div class="academy-info">
          <div class="academy-info__header">
            <h2 class="academy-name">
              {{ job.academyName }}
              <BaseBadge v-if="job.academy.isVerified" variant="success" size="small">
                ✓
              </BaseBadge>
            </h2>
            <div class="academy-rating">
              <StarIcon :size="16" fill="currentColor" />
              <span>{{ job.academy.rating.toFixed(1) }}</span>
            </div>
          </div>

          <div class="academy-info__location" @click="showMap">
            <MapPinIcon :size="16" />
            <span>{{ job.academy.address }}</span>
          </div>

          <BaseButton variant="secondary" block @click="viewAcademyProfile">
            학원 프로필 보기
          </BaseButton>
        </div>
      </section>

      <!-- 모집 요강 섹션 -->
      <section class="job-detail__section">
        <h3 class="section-title">모집 요강</h3>

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">공고 제목</span>
            <span class="info-value">{{ job.title }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">모집 장르</span>
            <div class="genre-tags">
              <BaseBadge v-for="genre in job.genres" :key="genre" variant="primary">
                {{ genre }}
              </BaseBadge>
            </div>
          </div>

          <div class="info-item">
            <span class="info-label">담당 수업</span>
            <span class="info-value">{{ job.classes }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">근무 요일 및 시간</span>
            <span class="info-value">{{ formatWorkSchedule(job.workSchedule) }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">급여 정보</span>
            <span class="info-value highlight">{{ formatSalary(job.salary, job.salaryType) }}</span>
          </div>

          <div v-if="job.benefits" class="info-item">
            <span class="info-label">우대 사항</span>
            <span class="info-value">{{ job.benefits }}</span>
          </div>
        </div>
      </section>

      <!-- 상세 설명 섹션 -->
      <section class="job-detail__section">
        <h3 class="section-title">상세 설명</h3>
        <div class="description">{{ job.description }}</div>
      </section>

      <!-- 하단 고정 버튼 -->
      <div class="job-detail__actions">
        <BaseButton variant="secondary" @click="handleInquiry">학원에게 문의하기</BaseButton>
        <BaseButton :disabled="job.hasApplied" @click="handleApply">
          {{ job.hasApplied ? '지원 완료' : '지원하기' }}
        </BaseButton>
      </div>

      <!-- 지원 확인 모달 -->
      <BaseModal
        v-model:isOpen="showApplyModal"
        title="지원 확인"
        @confirm="confirmApply"
        @cancel="showApplyModal = false"
      >
        <p>이 공고에 지원하시겠습니까?</p>
        <p class="modal-subtitle">지원 후에는 취소할 수 없습니다.</p>
      </BaseModal>
    </div>

    <BaseEmptyState v-else title="공고를 찾을 수 없습니다" description="삭제되었거나 존재하지 않는 공고입니다.">
      <template #action>
        <BaseButton @click="$router.push('/instructor/jobs')">목록으로 돌아가기</BaseButton>
      </template>
    </BaseEmptyState>
  </InstructorLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Star as StarIcon, MapPin as MapPinIcon } from 'lucide-vue-next'
import { InstructorLayout } from '@/components/layout'
import { BaseButton, BaseBadge, BaseModal, BaseLoading, BaseEmptyState } from '@/components/common'
import { useJobStore, useApplicationStore } from '@/stores'
import { formatSalary } from '@/utils/helpers'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const jobStore = useJobStore()
const applicationStore = useApplicationStore()
const { info } = useToast()

const job = ref(null)
const isLoading = ref(false)
const showApplyModal = ref(false)

const formatWorkSchedule = (schedule) => {
  if (!schedule) return ''
  return `${schedule.days.join(', ')} ${schedule.startTime}~${schedule.endTime}`
}

const handleApply = () => {
  if (job.value.hasApplied) return
  showApplyModal.value = true
}

const confirmApply = async () => {
  const result = await applicationStore.applyToJob(job.value.id)
  if (result.success) {
    job.value.hasApplied = true
    showApplyModal.value = false
  }
}

const handleInquiry = () => {
  info('학원 연락처: ' + job.value.academy.phone)
}

const viewAcademyProfile = () => {
  router.push(`/academy/${job.value.academy.id}`)
}

const showMap = () => {
  info('지도 보기 기능은 준비 중입니다.')
  // TODO: 지도 모달 표시
}

onMounted(async () => {
  isLoading.value = true
  const result = await jobStore.fetchJobDetail(route.params.id)
  if (result.success) {
    job.value = result.data
  }
  isLoading.value = false
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.job-detail {
  padding: $spacing-lg;
  padding-bottom: 100px; // 하단 고정 버튼 공간

  &__section {
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;
    padding: $spacing-xl;
    margin-bottom: $spacing-lg;
  }

  &__actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: $spacing-lg;
    background-color: $color-white;
    border-top: 1px solid $color-divider;
    display: flex;
    gap: $spacing-md;
    z-index: $z-index-fixed;

    @include mobile {
      bottom: $nav-height;
    }
  }
}

.academy-info {
  &__header {
    @include flex-between;
    margin-bottom: $spacing-md;
  }

  .academy-name {
    font-size: $font-size-h2;
    font-weight: $font-weight-bold;
    margin: 0;
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .academy-rating {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    color: $color-warning;
    font-weight: $font-weight-semibold;
  }

  &__location {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    color: $color-text-secondary;
    font-size: $font-size-body-small;
    margin-bottom: $spacing-lg;
    cursor: pointer;

    &:hover {
      color: $color-primary;
    }
  }
}

.section-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  margin: 0 0 $spacing-lg 0;
  padding-bottom: $spacing-md;
  border-bottom: 2px solid $color-divider;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;

  .info-label {
    font-size: $font-size-body-small;
    font-weight: $font-weight-semibold;
    color: $color-text-secondary;
  }

  .info-value {
    font-size: $font-size-body;
    color: $color-text-primary;

    &.highlight {
      font-size: $font-size-h2;
      font-weight: $font-weight-bold;
      color: $color-primary;
    }
  }
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.description {
  font-size: $font-size-body;
  color: $color-text-primary;
  line-height: $line-height-relaxed;
  white-space: pre-line;
}

.modal-subtitle {
  font-size: $font-size-body-small;
  color: $color-text-secondary;
  margin-top: $spacing-sm;
}
</style>

