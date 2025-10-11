<template>
  <InstructorLayout>
    <div class="my-page">
      <!-- 프로필 요약 -->
      <section class="my-page__profile">
        <div class="profile-summary">
          <div class="profile-summary__photo">
            <img v-if="profile?.profileImage" :src="profile.profileImage" alt="프로필 사진" />
            <UserIcon v-else :size="48" />
          </div>
          <div class="profile-summary__info">
            <h2 class="name">
              {{ profile?.name || '사용자' }}
              <BaseBadge v-if="isVerified" variant="success" size="small">✓</BaseBadge>
              <BaseBadge v-else-if="verificationStatus === 'pending'" variant="warning" size="small">
                대기
              </BaseBadge>
            </h2>
            <p class="email">{{ profile?.email }}</p>
          </div>
        </div>
        <BaseButton variant="secondary" block @click="$router.push('/instructor/profile/edit')">
          프로필 관리
        </BaseButton>
      </section>

      <!-- 내 활동 -->
      <section class="my-page__section">
        <h3 class="section-title">내 활동</h3>
        <div class="menu-list">
          <router-link to="/instructor/applications" class="menu-item">
            <div class="menu-item__icon">
              <FileTextIcon :size="20" />
            </div>
            <span class="menu-item__text">지원 현황</span>
            <BaseBadge v-if="applicationCount > 0" variant="primary" dot>
              {{ applicationCount }}
            </BaseBadge>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>

          <router-link to="/instructor/favorites" class="menu-item">
            <div class="menu-item__icon">
              <HeartIcon :size="20" />
            </div>
            <span class="menu-item__text">찜한 공고</span>
            <BaseBadge v-if="favoriteCount > 0" variant="primary" dot>
              {{ favoriteCount }}
            </BaseBadge>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>

          <router-link to="/instructor/reviews" class="menu-item">
            <div class="menu-item__icon">
              <StarIcon :size="20" />
            </div>
            <span class="menu-item__text">내가 작성한 리뷰</span>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>
        </div>
      </section>

      <!-- 인증 관리 -->
      <section class="my-page__section">
        <h3 class="section-title">인증 관리</h3>
        <div class="menu-list">
          <router-link to="/instructor/verification" class="menu-item">
            <div class="menu-item__icon">
              <ShieldCheckIcon :size="20" />
            </div>
            <span class="menu-item__text">학력/경력 인증</span>
            <BaseBadge :variant="verificationBadgeVariant">{{ verificationBadgeText }}</BaseBadge>
            <ChevronRightIcon :size="20" class="menu-item__arrow" />
          </router-link>
        </div>
      </section>

      <!-- 설정 -->
      <section class="my-page__section">
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
  </InstructorLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  User as UserIcon,
  FileText as FileTextIcon,
  Heart as HeartIcon,
  Star as StarIcon,
  ShieldCheck as ShieldCheckIcon,
  Bell as BellIcon,
  Settings as SettingsIcon,
  HelpCircle as HelpCircleIcon,
  LogOut as LogOutIcon,
  ChevronRight as ChevronRightIcon,
} from 'lucide-vue-next'
import { InstructorLayout } from '@/components/layout'
import { BaseButton, BaseBadge } from '@/components/common'
import { useAuthStore, useProfileStore, useApplicationStore, useJobStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const applicationStore = useApplicationStore()
const jobStore = useJobStore()

const profile = computed(() => profileStore.profile)
const verificationStatus = computed(() => profileStore.verificationStatus?.status || 'unverified')
const applicationCount = computed(() => applicationStore.applicationCount)
const favoriteCount = computed(() => jobStore.favoriteJobs.length)

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
  }
}

onMounted(async () => {
  await Promise.all([
    profileStore.fetchProfile(),
    profileStore.fetchVerificationStatus(),
    applicationStore.fetchMyApplications(),
    jobStore.fetchFavoriteJobs(),
  ])
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.my-page {
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

.profile-summary {
  display: flex;
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;

  &__photo {
    width: 80px;
    height: 80px;
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

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .name {
      font-size: $font-size-h3;
      font-weight: $font-weight-semibold;
      margin: 0 0 $spacing-xs 0;
      display: flex;
      align-items: center;
      gap: $spacing-sm;
    }

    .email {
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      margin: 0;
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

