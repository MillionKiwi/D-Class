<template>
  <AppLayout>
    <div class="academy-manage-page page-container">
      <div class="page-header card">
        <div class="academy-avatar">
          <img
            v-if="user?.academy_image"
            :src="user.academy_image"
            alt="학원 이미지"
          />
          <div v-else class="avatar-placeholder">🏢</div>
        </div>
        <h2 class="academy-name">
          {{ user?.academy_name || '학원명' }}
          <Badge v-if="user?.is_verified" variant="success" small>✓</Badge>
        </h2>
        <p class="academy-rating">
          ⭐ {{ user?.average_rating || 'N/A' }}
          <span>({{ user?.review_count || 0 }}개 리뷰)</span>
        </p>
        <Button @click="$router.push('/academy/profile/edit')">학원 정보 관리</Button>
      </div>

      <div class="menu-section card">
        <h3 class="section-title">내 활동</h3>
        <router-link to="/academy/postings" class="menu-item">
          <span>공고 관리</span>
          <span>→</span>
        </router-link>
        <router-link to="/academy/applications" class="menu-item">
          <span>지원자 관리</span>
          <span>→</span>
        </router-link>
        <router-link to="/academy/hired" class="menu-item">
          <span>채용 현황</span>
          <span>→</span>
        </router-link>
        <router-link to="/reviews/my" class="menu-item">
          <span>내가 작성한 리뷰</span>
          <span>→</span>
        </router-link>
      </div>

        <div class="menu-section card">
          <h3 class="section-title">인증 관리</h3>
          <router-link to="/academy/verification" class="menu-item">
            <span>사업자 인증</span>
            <Badge :variant="getVerificationBadgeVariant(user?.verification_status)">
              {{ getVerificationLabel(user?.verification_status) }}
            </Badge>
          </router-link>
        </div>

      <div class="menu-section card">
        <h3 class="section-title">설정</h3>
        <router-link to="/settings/notifications" class="menu-item">
          <span>알림 설정</span>
          <span>→</span>
        </router-link>
        <router-link to="/settings/account" class="menu-item">
          <span>계정 설정</span>
          <span>→</span>
        </router-link>
        <router-link to="/support" class="menu-item">
          <span>고객센터</span>
          <span>→</span>
        </router-link>
        <button class="menu-item logout-btn" @click="handleLogout">
          <span>로그아웃</span>
          <span>→</span>
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'

const router = useRouter()
const authStore = useAuthStore()
const showToast = inject('toast')

const user = computed(() => authStore.user)

const getVerificationLabel = (status) => {
  const labels = {
    none: '미인증',
    pending: '인증 대기',
    approved: '인증 완료',
    rejected: '인증 반려',
  }
  return labels[status] || '미인증'
}

const getVerificationBadgeVariant = (status) => {
  const variants = {
    none: 'disabled',
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
  }
  return variants[status] || 'disabled'
}

const handleLogout = async () => {
  await authStore.logout()
  showToast('로그아웃되었습니다', 'success')
  router.push('/login')
}

onMounted(async () => {
  if (!user.value) {
    await authStore.fetchCurrentUser()
  }
})
</script>

<style scoped>
.academy-manage-page {
  padding: var(--spacing-lg);
}

.page-header {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.academy-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto var(--spacing-lg);
  overflow: hidden;
  background-color: var(--color-divider);
  display: flex;
  align-items: center;
  justify-content: center;
}

.academy-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 60px;
}

.academy-name {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.academy-rating {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
}

.menu-section {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-divider);
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  text-decoration: none;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-divider);
  transition: color 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  color: var(--color-primary);
}

.logout-btn {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 16px;
}
</style>
