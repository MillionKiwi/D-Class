<template>
  <AcademyLayout>
    <div class="academy-management">
      <!-- 학원 정보 요약 -->
      <section class="academy-management__profile">
        <div class="academy-summary">
          <div class="academy-summary__image">
            <img v-if="profile?.image" :src="profile.image" alt="학원 대표 이미지" />
            <BuildingIcon v-else :size="48" />
          </div>
          <div class="academy-summary__info">
            <h2 class="name">
              {{ profile?.name || '학원명' }}
              <BaseBadge v-if="isVerified" variant="success" size="small">✓</BaseBadge>
              <BaseBadge v-else-if="verificationStatus === 'pending'" variant="warning" size="small">
                대기
              </BaseBadge>
            </h2>
            <div class="rating">
              <StarIcon :size="16" fill="currentColor" />
              <span>{{ profile?.rating?.toFixed(1) || '0.0' }}</span>
              <span class="review-count">({{ profile?.reviewCount || 0 }}개 리뷰)</span>
            </div>
          </div>
        </div>
        <BaseButton variant="secondary" block @click="$router.push('/academy/profile/edit')">
          학원 정보 관리
        </BaseButton>
      </section>

      <!-- 내 활동 -->
      <section class="academy-management__section">
        <h3 class="section-title">내 활동</h3>
        <div class="menu-list">
          <router-link to="/academy/jobs" class="menu-item">
            <div class="menu-item__icon">
              <BriefcaseIcon :size="20" />
            </div>
            <span class="menu-item__text">공고 관리</span>
            <BaseBadge v-if="jobCount > 0" variant="primary" dot>
              {{ jobCount }}
            </BaseBadge>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>

          <router-link to="/academy/applicants" class="menu-item">
            <div class="menu-item__icon">
              <UsersIcon :size="20" />
            </div>
            <span class="menu-item__text">지원자 관리</span>
            <BaseBadge v-if="newApplicantsCount > 0" variant="error" dot>
              {{ newApplicantsCount }}
            </BaseBadge>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>

          <router-link to="/academy/hired" class="menu-item">
            <div class="menu-item__icon">
              <UserCheckIcon :size="20" />
            </div>
            <span class="menu-item__text">채용 현황</span>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>

          <router-link to="/academy/reviews" class="menu-item">
            <div class="menu-item__icon">
              <StarIcon :size="20" />
            </div>
            <span class="menu-item__text">내가 작성한 리뷰</span>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>
        </div>
      </section>

      <!-- 인증 관리 -->
      <section class="academy-management__section">
        <h3 class="section-title">인증 관리</h3>
        <div class="menu-list">
          <router-link to="/academy/verification" class="menu-item">
            <div class="menu-item__icon">
              <ShieldCheckIcon :size="20" />
            </div>
            <span class="menu-item__text">사업자 인증</span>
            <BaseBadge :variant="verificationBadgeVariant">{{ verificationBadgeText }}</BaseBadge>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>
        </div>
      </section>

      <!-- 설정 -->
      <section class="academy-management__section">
        <h3 class="section-title">설정</h3>
        <div class="menu-list">
          <router-link to="/settings/notifications" class="menu-item">
            <div class="menu-item__icon">
              <BellIcon :size="20" />
            </div>
            <span class="menu-item__text">알림 설정</span>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>

          <router-link to="/settings/account" class="menu-item">
            <div class="menu-item__icon">
              <SettingsIcon :size="20" />
            </div>
            <span class="menu-item__text">계정 설정</span>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>

          <router-link to="/support" class="menu-item">
            <div class="menu-item__icon">
              <HelpCircleIcon :size="20" />
            </div>
            <span class="menu-item__text">고객센터</span>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>

          <button class="menu-item" @click="handleLogout">
            <div class="menu-item__icon">
              <LogOutIcon :size="20" />
            </div>
            <span class="menu-item__text logout-text">로그아웃</span>
          </button>
        </div>
      </section>
    </div>
  </AcademyLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Building as BuildingIcon,
  Star as StarIcon,
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
  UserCheck as UserCheckIcon,
  ShieldCheck as ShieldCheckIcon,
  Bell as BellIcon,
  Settings as SettingsIcon,
  HelpCircle as HelpCircleIcon,
  LogOut as LogOutIcon,
  ChevronRight as ChevronRightIcon,
} from 'lucide-vue-next'
import { AcademyLayout } from '@/components/layout'
import { BaseButton, BaseBadge } from '@/components/common'
import { useAuthStore, useProfileStore, useJobStore, useApplicationStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const jobStore = useJobStore()
const applicationStore = useApplicationStore()

const profile = computed(() => profileStore.profile)
const verificationStatus = computed(() => profileStore.verificationStatus?.status || 'unverified')
const jobCount = computed(() => jobStore.jobs.length)
const newApplicantsCount = computed(() => applicationStore.newApplicantsCount)

const isVerified = computed(() => verificationStatus.value === 'verified')

const verificationBadgeVariant = computed(() => {
  const variants = {
    unverified: 'warning',
    pending: 'info',
    verified: 'success',
    rejected: 'error',
  }
  return variants[verificationStatus.value]
})

const verificationBadgeText = computed(() => {
  const texts = {
    unverified: '미인증',
    pending: '인증 대기',
    verified: '인증 완료',
    rejected: '인증 반려',
  }
  return texts[verificationStatus.value]
})

const handleLogout = async () => {
  if (confirm('로그아웃하시겠습니까?')) {
    await authStore.logout()
    router.push('/login')
  }
}

onMounted(async () => {
  await Promise.all([
    profileStore.fetchProfile(),
    profileStore.fetchVerificationStatus(),
    jobStore.fetchJobs(),
    applicationStore.fetchApplicants(),
  ])
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.academy-management {
  padding: $spacing-lg;

  &__profile {
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;
    padding: $spacing-xl;
    margin-bottom: $spacing-lg;
  }

  &__section {
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;
    padding: $spacing-xl;
    margin-bottom: $spacing-lg;
  }
}

.academy-summary {
  display: flex;
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;

  &__image {
    width: 100px;
    height: 100px;
    border-radius: $radius-lg;
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

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .name {
      font-size: $font-size-h3;
      font-weight: $font-weight-bold;
      margin: 0 0 $spacing-sm 0;
      display: flex;
      align-items: center;
      gap: $spacing-sm;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      color: $color-warning;
      font-weight: $font-weight-semibold;

      span {
        color: $color-text-primary;
      }

      .review-count {
        font-size: $font-size-body-small;
        color: $color-text-secondary;
        font-weight: $font-weight-regular;
      }
    }
  }
}

.section-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  margin: 0 0 $spacing-lg 0;
  color: $color-text-primary;
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg 0;
  border-bottom: 1px solid $color-divider;
  text-decoration: none;
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  width: 100%;
  cursor: pointer;
  transition: all $transition-fast;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba($color-primary, 0.02);
  }

  &__icon {
    @include flex-center;
    width: 40px;
    height: 40px;
    background-color: $color-background;
    border-radius: $radius-md;
    color: $color-primary;
    flex-shrink: 0;
  }

  &__text {
    flex: 1;
    font-size: $font-size-body;
    color: $color-text-primary;
    text-align: left;
  }

  .logout-text {
    color: $color-error;
  }

  &__arrow {
    color: $color-text-secondary;
    flex-shrink: 0;
  }
}
</style>

