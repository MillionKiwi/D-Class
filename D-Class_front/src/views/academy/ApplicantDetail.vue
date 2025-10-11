<template>
  <AcademyLayout>
    <div v-if="isLoading" class="applicant-detail">
      <BaseLoading type="skeleton" inline :lines="10" />
    </div>

    <div v-else-if="applicant" class="applicant-detail">
      <!-- 헤더 -->
      <div class="applicant-detail__header">
        <button class="back-button" @click="$router.back()">
          <ArrowLeftIcon :size="24" />
        </button>
        <h1>{{ applicant.name }}</h1>
        <div style="width: 44px"></div>
      </div>

      <!-- 기본 정보 -->
      <section class="applicant-detail__section">
        <div class="profile-header">
          <div class="profile-photo">
            <img v-if="applicant.profileImage" :src="applicant.profileImage" alt="프로필" />
            <UserIcon v-else :size="64" />
          </div>
          <div class="profile-info">
            <h2 class="name">
              {{ applicant.name }}
              <BaseBadge v-if="applicant.isVerified" variant="success" size="small">✓</BaseBadge>
            </h2>
            <p class="contact">
              <PhoneIcon :size="16" />
              {{ isHired ? applicant.phone : maskPhoneNumber(applicant.phone) }}
            </p>
            <div class="genres">
              <BaseBadge v-for="genre in applicant.genres" :key="genre" variant="primary">
                {{ genre }}
              </BaseBadge>
            </div>
          </div>
        </div>
      </section>

      <!-- 자기소개 -->
      <section v-if="applicant.bio" class="applicant-detail__section">
        <h3 class="section-title">자기소개</h3>
        <p class="bio">{{ applicant.bio }}</p>
      </section>

      <!-- 경력 -->
      <section v-if="applicant.careers?.length > 0" class="applicant-detail__section">
        <h3 class="section-title">경력</h3>
        <div class="item-list">
          <div v-for="career in applicant.careers" :key="career.id" class="item-card">
            <div class="item-card__icon">
              <BriefcaseIcon :size="20" />
              <CheckIcon
                v-if="applicant.isVerified"
                :size="12"
                class="verified-icon"
              />
            </div>
            <div class="item-card__content">
              <h4>{{ career.company }}</h4>
              <p class="period">{{ career.period }}</p>
              <p class="description">{{ career.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 학력 -->
      <section v-if="applicant.educations?.length > 0" class="applicant-detail__section">
        <h3 class="section-title">학력</h3>
        <div class="item-list">
          <div v-for="education in applicant.educations" :key="education.id" class="item-card">
            <div class="item-card__icon">
              <GraduationCapIcon :size="20" />
              <CheckIcon
                v-if="applicant.isVerified"
                :size="12"
                class="verified-icon"
              />
            </div>
            <div class="item-card__content">
              <h4>{{ education.school }}</h4>
              <p class="period">{{ education.period }}</p>
              <p class="description">{{ education.major }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 평균 평점 & 리뷰 -->
      <section v-if="applicant.rating" class="applicant-detail__section">
        <h3 class="section-title">평점 및 리뷰</h3>
        <div class="rating-summary">
          <StarIcon :size="24" fill="currentColor" />
          <span class="rating-score">{{ applicant.rating.toFixed(1) }}</span>
          <span class="rating-count">({{ applicant.reviewCount }}개 리뷰)</span>
        </div>
      </section>

      <!-- 하단 고정 액션 버튼 -->
      <div v-if="!isHired" class="applicant-detail__actions">
        <BaseButton variant="secondary" @click="handleReject">불합격 처리</BaseButton>
        <BaseButton @click="handleAccept">채용 확정</BaseButton>
      </div>

      <!-- 채용 확정 모달 -->
      <BaseModal
        v-model:isOpen="showAcceptModal"
        title="채용 확정"
        @confirm="confirmAccept"
        @cancel="showAcceptModal = false"
      >
        <p>해당 강사를 최종 채용하시겠습니까?</p>
        <div class="modal-info">
          <p>✓ 연락처 전체 공개</p>
          <p>✓ 리뷰 작성 가능</p>
          <p>✓ 강사에게 알림 발송</p>
        </div>
      </BaseModal>

      <!-- 불합격 모달 -->
      <BaseModal
        v-model:isOpen="showRejectModal"
        title="불합격 처리"
        confirmText="불합격 처리"
        @confirm="confirmReject"
        @cancel="showRejectModal = false"
      >
        <p>불합격 처리하시겠습니까?</p>
        <p class="modal-subtitle">강사에게 알림이 발송됩니다.</p>
      </BaseModal>
    </div>

    <BaseEmptyState
      v-else
      title="지원자를 찾을 수 없습니다"
      description="삭제되었거나 존재하지 않는 지원자입니다"
    >
      <template #action>
        <BaseButton @click="$router.push('/academy/applicants')">목록으로 돌아가기</BaseButton>
      </template>
    </BaseEmptyState>
  </AcademyLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft as ArrowLeftIcon,
  User as UserIcon,
  Phone as PhoneIcon,
  Briefcase as BriefcaseIcon,
  GraduationCap as GraduationCapIcon,
  Star as StarIcon,
  Check as CheckIcon,
} from 'lucide-vue-next'
import { AcademyLayout } from '@/components/layout'
import { BaseButton, BaseBadge, BaseModal, BaseLoading, BaseEmptyState } from '@/components/common'
import { useApplicationStore } from '@/stores'
import { APPLICATION_STATUS } from '@/utils/constants'
import { maskPhoneNumber } from '@/utils/validators'

const route = useRoute()
const router = useRouter()
const applicationStore = useApplicationStore()

const applicant = ref(null)
const isLoading = ref(false)
const showAcceptModal = ref(false)
const showRejectModal = ref(false)

const isHired = computed(() => applicant.value?.status === APPLICATION_STATUS.ACCEPTED)

const handleAccept = () => {
  showAcceptModal.value = true
}

const confirmAccept = async () => {
  const result = await applicationStore.acceptApplicant(applicant.value.id)
  if (result.success) {
    applicant.value.status = APPLICATION_STATUS.ACCEPTED
    showAcceptModal.value = false
  }
}

const handleReject = () => {
  showRejectModal.value = true
}

const confirmReject = async () => {
  const result = await applicationStore.rejectApplicant(applicant.value.id)
  if (result.success) {
    applicant.value.status = APPLICATION_STATUS.REJECTED
    showRejectModal.value = false
  }
}

onMounted(async () => {
  isLoading.value = true
  const result = await applicationStore.fetchApplicantDetail(route.params.id)
  if (result.success) {
    applicant.value = result.data
  }
  isLoading.value = false
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.applicant-detail {
  padding-bottom: 100px; // 하단 고정 버튼 공간

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

.profile-header {
  display: flex;
  gap: $spacing-lg;
}

.profile-photo {
  width: 100px;
  height: 100px;
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

.profile-info {
  flex: 1;

  .name {
    font-size: $font-size-h2;
    font-weight: $font-weight-bold;
    margin: 0 0 $spacing-sm 0;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  .contact {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-body-small;
    color: $color-text-secondary;
    margin: 0 0 $spacing-md 0;
  }

  .genres {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
  }
}

.section-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  margin: 0 0 $spacing-lg 0;
  padding-bottom: $spacing-md;
  border-bottom: 2px solid $color-divider;
}

.bio {
  font-size: $font-size-body;
  color: $color-text-primary;
  line-height: $line-height-relaxed;
  white-space: pre-line;
  margin: 0;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.item-card {
  display: flex;
  gap: $spacing-md;

  &__icon {
    position: relative;
    @include flex-center;
    width: 48px;
    height: 48px;
    background-color: rgba($color-primary, 0.1);
    border-radius: $radius-md;
    color: $color-primary;
    flex-shrink: 0;

    .verified-icon {
      position: absolute;
      bottom: -2px;
      right: -2px;
      background-color: $color-success;
      color: $color-white;
      border-radius: 50%;
      padding: 2px;
    }
  }

  &__content {
    flex: 1;

    h4 {
      font-size: $font-size-body;
      font-weight: $font-weight-semibold;
      margin: 0 0 $spacing-xs 0;
    }

    .period {
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      margin: 0 0 $spacing-sm 0;
    }

    .description {
      font-size: $font-size-body-small;
      color: $color-text-primary;
      margin: 0;
    }
  }
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  color: $color-warning;

  .rating-score {
    font-size: $font-size-h2;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
  }

  .rating-count {
    font-size: $font-size-body-small;
    color: $color-text-secondary;
  }
}

.modal-info {
  margin-top: $spacing-lg;
  padding: $spacing-md;
  background-color: $color-background;
  border-radius: $radius-md;

  p {
    font-size: $font-size-body-small;
    color: $color-text-primary;
    margin: $spacing-xs 0;
  }
}

.modal-subtitle {
  font-size: $font-size-body-small;
  color: $color-text-secondary;
  margin-top: $spacing-sm;
}
</style>

