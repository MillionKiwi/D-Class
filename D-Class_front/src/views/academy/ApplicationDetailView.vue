<template>
  <AppLayout>
    <div v-if="loading && !application" class="loading-container">
      <LoadingSpinner />
    </div>

    <div v-else-if="application" class="application-detail-page page-container">
      <div class="application-header card">
        <h2 class="instructor-name">
          {{ application.instructor.name }}
          <Badge v-if="application.instructor.is_verified" variant="success" small>✓</Badge>
        </h2>
        <Badge :variant="getStatusBadgeVariant(application.status)">
          {{ getStatusLabel(application.status) }}
        </Badge>
      </div>

      <div class="instructor-profile card">
        <div class="profile-avatar">
          <img
            v-if="application.instructor.profile_image"
            :src="application.instructor.profile_image"
            alt="프로필"
          />
          <div v-else class="avatar-placeholder">👤</div>
        </div>

        <div class="profile-info">
          <div class="info-item">
            <span class="info-label">전문 분야</span>
            <span class="info-value">{{ application.instructor.specialties?.join(', ') || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">평균 평점</span>
            <span class="info-value">⭐ {{ application.instructor.average_rating || 'N/A' }}</span>
          </div>
        </div>

        <div v-if="application.instructor.bio" class="bio-section">
          <h4>자기소개</h4>
          <p>{{ application.instructor.bio }}</p>
        </div>

        <div class="profile-action">
          <Button variant="secondary" small @click="viewInstructorProfile">
            강사 프로필 보기
          </Button>
        </div>
      </div>

      <div class="action-section">
        <Button
          variant="error"
          @click="handleReject"
          :disabled="application.status === 'rejected'"
        >
          불합격 처리
        </Button>
        <Button
          @click="handleAccept"
          :disabled="application.status === 'accepted'"
        >
          채용 확정
        </Button>
      </div>

      <!-- 채용 확정 확인 모달 -->
      <Modal v-model:visible="showAcceptModal" title="채용 확정" @close="showAcceptModal = false">
        <p>해당 강사를 최종 채용하시겠습니까?</p>
        <template #footer>
          <Button variant="secondary" @click="showAcceptModal = false">취소</Button>
          <Button @click="confirmAccept">채용 확정</Button>
        </template>
      </Modal>

      <!-- 불합격 확인 모달 -->
      <Modal v-model:visible="showRejectModal" title="불합격 처리" @close="showRejectModal = false">
        <p>불합격 처리하시겠습니까?</p>
        <template #footer>
          <Button variant="secondary" @click="showRejectModal = false">취소</Button>
          <Button variant="error" @click="confirmReject">불합격 처리</Button>
        </template>
      </Modal>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApplicationStore } from '@/stores/application'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'

const route = useRoute()
const router = useRouter()
const applicationStore = useApplicationStore()
const showToast = inject('toast')

const applicationId = computed(() => parseInt(route.params.id))
const application = computed(() => applicationStore.currentApplication)
const loading = computed(() => applicationStore.loading)
const showAcceptModal = ref(false)
const showRejectModal = ref(false)

const fetchApplication = async () => {
  const result = await applicationStore.fetchApplicationDetail(applicationId.value)
  if (!result.success) {
    showToast('지원자 정보를 불러오는데 실패했습니다', 'error')
  }
}

const handleAccept = () => {
  showAcceptModal.value = true
}

const confirmAccept = async () => {
  const result = await applicationStore.acceptApplication(applicationId.value)
  if (result.success) {
    showToast('채용이 확정되었습니다', 'success')
    showAcceptModal.value = false
    await fetchApplication()
    router.push('/academy/applications')
  } else {
    showToast(result.error || '채용 확정에 실패했습니다', 'error')
  }
}

const handleReject = () => {
  showRejectModal.value = true
}

const confirmReject = async () => {
  const result = await applicationStore.rejectApplication(applicationId.value)
  if (result.success) {
    showToast('불합격 처리되었습니다', 'success')
    showRejectModal.value = false
    await fetchApplication()
    router.push('/academy/applications')
  } else {
    showToast(result.error || '처리에 실패했습니다', 'error')
  }
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '새 지원',
    reviewing: '검토중',
    accepted: '채용 확정',
    rejected: '불합격',
  }
  return labels[status] || status
}

const getStatusBadgeVariant = (status) => {
  const variants = {
    pending: 'info',
    reviewing: 'warning',
    accepted: 'success',
    rejected: 'error',
  }
  return variants[status] || 'info'
}

const viewInstructorProfile = () => {
  if (application.value?.instructor?.id) {
    router.push({
      name: 'InstructorProfile',
      params: { id: application.value.instructor.id },
    })
  }
}

onMounted(() => {
  fetchApplication()
})
</script>

<style scoped>
.application-detail-page {
  padding: var(--spacing-lg);
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-xl);
}

.instructor-name {
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.instructor-profile {
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

.profile-info {
  margin-bottom: var(--spacing-xl);
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-divider);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: var(--color-text-primary);
}

.bio-section {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-divider);
}

.bio-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.bio-section p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-primary);
  white-space: pre-wrap;
}

.profile-action {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-divider);
  text-align: center;
}

.action-section {
  display: flex;
  gap: var(--spacing-md);
  position: sticky;
  bottom: 80px;
  background-color: var(--color-background);
  padding: var(--spacing-lg);
  margin: 0 calc(-1 * var(--spacing-lg));
  border-top: 1px solid var(--color-divider);
}

.action-section .btn {
  flex: 1;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
