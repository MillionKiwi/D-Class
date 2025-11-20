<template>
  <AppLayout>
    <div class="profile-page page-container">
      <div v-if="loading && !user" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else-if="user" class="profile-content">
        <div class="profile-header card">
          <div class="profile-avatar">
            <img
              v-if="user.profile_image"
              :src="user.profile_image"
              alt="프로필 이미지"
            />
            <div v-else class="avatar-placeholder">👤</div>
          </div>
          <h2 class="profile-name">
            {{ user.name }}
            <Badge v-if="user.is_verified" variant="success" small>✓</Badge>
          </h2>
          <p class="profile-email">{{ user.email }}</p>
          <Button @click="$router.push('/profile/edit')">프로필 관리</Button>
        </div>

        <div class="menu-section card">
          <h3 class="section-title">내 활동</h3>
          <router-link to="/applications" class="menu-item">
            <span>지원 현황</span>
            <span>→</span>
          </router-link>
          <router-link to="/favorites" class="menu-item">
            <span>찜한 공고</span>
            <span>→</span>
          </router-link>
          <router-link to="/reviews/my" class="menu-item">
            <span>내가 작성한 리뷰</span>
            <span>→</span>
          </router-link>
        </div>

        <div class="menu-section card">
          <h3 class="section-title">인증 관리</h3>
          <router-link to="/verification" class="menu-item">
            <span>학력/경력 인증</span>
            <Badge :variant="getVerificationBadgeVariant(user.verification_status)">
              {{ getVerificationLabel(user.verification_status) }}
            </Badge>
          </router-link>
        </div>

        <div class="menu-section card">
          <h3 class="section-title">설정</h3>
          <router-link to="/notifications" class="menu-item">
            <span>알림</span>
            <Badge v-if="unreadCount > 0" variant="error" small>{{ unreadCount }}</Badge>
            <span>→</span>
          </router-link>
          <router-link to="/settings/notifications" class="menu-item">
            <span>알림 설정</span>
            <span>→</span>
          </router-link>
          <router-link to="/settings/account" class="menu-item">
            <span>계정 설정</span>
            <span>→</span>
          </router-link>
          <router-link to="/subscription" class="menu-item">
            <span>구독</span>
            <span>→</span>
          </router-link>
          <router-link to="/support" class="menu-item">
            <span>고객센터</span>
            <span>→</span>
          </router-link>
          <button class="menu-item logout-btn" @click="showLogoutModal = true">
            <span>로그아웃</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 로그아웃 확인 모달 -->
    <Modal :visible="showLogoutModal" title="로그아웃" @close="showLogoutModal = false">
      <div class="logout-confirm">
        <p>정말 로그아웃하시겠습니까?</p>
      </div>
      <template #footer>
        <Button variant="secondary" @click="showLogoutModal = false">취소</Button>
        <Button variant="primary" @click="handleLogout">로그아웃</Button>
      </template>
    </Modal>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const showToast = inject('toast')

const user = computed(() => authStore.user)
const loading = computed(() => authStore.loading)
const unreadCount = computed(() => notificationStore.unreadCount)
const showLogoutModal = ref(false)

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
  showLogoutModal.value = false
  await authStore.logout()
  showToast('로그아웃되었습니다', 'success')
  router.push('/login')
}

onMounted(async () => {
  if (!user.value) {
    await authStore.fetchCurrentUser()
  }
  // 알림 카운트 로드
  await notificationStore.fetchNotifications({ page_size: 1 })
})
</script>

<style scoped>
.profile-page {
  padding: var(--spacing-lg);
}

.profile-header {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 0 auto var(--spacing-lg);
  overflow: hidden;
  background-color: var(--color-divider);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 48px;
}

.profile-name {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.profile-email {
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

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.logout-confirm {
  padding: var(--spacing-md);
  text-align: center;
}

.logout-confirm p {
  margin: 0;
  font-size: 16px;
  color: var(--color-text-primary);
}
</style>
