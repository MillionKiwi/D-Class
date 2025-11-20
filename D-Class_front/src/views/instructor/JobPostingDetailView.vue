<template>
  <AppLayout>
    <div v-if="loading && !posting" class="loading-container">
      <LoadingSpinner />
    </div>

    <div v-else-if="posting" class="job-posting-detail page-container">
      <div class="academy-section card">
        <h3 class="academy-name">
          {{ posting.academy.name }}
          <Badge v-if="posting.academy.is_verified" variant="success" small>✓</Badge>
        </h3>
        <div class="academy-rating">
          ⭐ {{ posting.academy.average_rating || 'N/A' }}
          <span>({{ posting.academy.review_count || 0 }}개 리뷰)</span>
        </div>
        <p class="academy-location">📍 {{ posting.academy.address || '주소 정보 없음' }}</p>
        <Button variant="secondary" @click="viewAcademyProfile">학원 프로필 보기</Button>
      </div>

      <div class="posting-section card">
        <h2 class="posting-title">{{ posting.title }}</h2>

        <div class="posting-details">
          <div class="detail-item">
            <span class="detail-label">모집 장르</span>
            <span class="detail-value">{{ formatGenres(posting.genres) }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">담당 수업</span>
            <span class="detail-value">{{ posting.classes || '-' }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">근무 요일</span>
            <span class="detail-value">{{ formatDays(posting.work_days) }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">근무 시간</span>
            <span class="detail-value">🕐 {{ posting.work_time }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">급여</span>
            <span class="detail-value salary">💰 {{ formatSalary(posting) }}</span>
          </div>

          <div v-if="posting.preferred_qualifications" class="detail-item">
            <span class="detail-label">우대 사항</span>
            <span class="detail-value">{{ posting.preferred_qualifications }}</span>
          </div>
        </div>

        <div v-if="posting.description" class="description-section">
          <h4>상세 설명</h4>
          <p class="description-text">{{ posting.description }}</p>
        </div>
      </div>

      <div class="action-section">
        <Button variant="secondary" @click="contactAcademy">학원에게 문의하기</Button>
        <Button
          v-if="!posting.is_applied"
          :loading="applying"
          @click="handleApply"
        >
          지원하기
        </Button>
        <Button
          v-else-if="currentApplication?.status === 'accepted' && currentApplication?.can_review !== false"
          variant="secondary"
          @click="writeReview"
        >
          리뷰 작성하기
        </Button>
        <Button
          v-else-if="currentApplication?.status === 'accepted' && currentApplication?.can_review === false && currentApplication?.review_id"
          variant="secondary"
          @click="editReview"
        >
          리뷰 수정하기
        </Button>
        <Button
          v-else-if="currentApplication?.status !== 'accepted'"
          variant="error"
          :loading="cancelling"
          @click="handleCancel"
        >
          지원 취소
        </Button>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>공고를 찾을 수 없습니다</p>
      <Button @click="$router.push('/home')">목록으로 돌아가기</Button>
    </div>

    <!-- 지원 확인 모달 -->
    <Modal :visible="showApplyModal" title="지원 확인" @close="showApplyModal = false">
      <p>이 공고에 지원하시겠습니까?</p>
      <template #footer>
        <Button variant="secondary" @click="showApplyModal = false" :disabled="applying">취소</Button>
        <Button @click="confirmApply" :loading="applying">지원하기</Button>
      </template>
    </Modal>

    <!-- 지원 취소 확인 모달 -->
    <Modal :visible="showCancelModal" title="지원 취소" @close="showCancelModal = false">
      <div class="cancel-confirm">
        <p>정말 지원을 취소하시겠습니까?</p>
        <p class="cancel-warning">취소된 지원은 복구할 수 없습니다.</p>
      </div>
      <template #footer>
        <Button variant="secondary" @click="showCancelModal = false" :disabled="cancelling">취소</Button>
        <Button variant="error" @click="confirmCancel" :loading="cancelling">지원 취소</Button>
      </template>
    </Modal>

    <!-- 인증 필요 안내 모달 -->
    <Modal :visible="showVerificationModal" title="인증 필요" @close="showVerificationModal = false">
      <div class="verification-notice">
        <p><strong>공고에 지원하려면 인증이 필요합니다.</strong></p>
        <p class="verification-message">
          학력/경력 인증을 완료하신 후 지원하실 수 있습니다.
        </p>
        <div v-if="user?.verification_status === 'pending'" class="verification-status">
          <p>현재 인증 대기 중입니다. 검토까지 1-2일 소요됩니다.</p>
        </div>
        <div v-else-if="user?.verification_status === 'rejected'" class="verification-status">
          <p>인증이 반려되었습니다. 인증 페이지에서 재신청해주세요.</p>
        </div>
        <div v-else class="verification-status">
          <p>인증을 신청해주세요.</p>
        </div>
      </div>
      <template #footer>
        <Button variant="secondary" @click="showVerificationModal = false">닫기</Button>
        <Button @click="goToVerification">인증 페이지로 이동</Button>
      </template>
    </Modal>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobPostingStore } from '@/stores/jobPosting'
import { useApplicationStore } from '@/stores/application'
import { useAuthStore } from '@/stores/auth'
import { inject } from 'vue'
import { formatGenres, formatDays } from '@/utils/formatters'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'

const route = useRoute()
const router = useRouter()
const jobPostingStore = useJobPostingStore()
const applicationStore = useApplicationStore()
const authStore = useAuthStore()
const showToast = inject('toast', () => {})

const postingId = computed(() => parseInt(route.params.id))
const posting = computed(() => jobPostingStore.currentPosting)
const loading = computed(() => jobPostingStore.loading)
const user = computed(() => authStore.user)
const applying = ref(false)
const cancelling = ref(false)
const showApplyModal = ref(false)
const showCancelModal = ref(false)
const showVerificationModal = ref(false)
const currentApplication = ref(null)

const fetchPosting = async () => {
  const result = await jobPostingStore.fetchPostingDetail(postingId.value)
  if (!result.success) {
    if (showToast && typeof showToast === 'function') {
    showToast('공고를 불러오는데 실패했습니다', 'error')
    }
    return
  }
  
  // 지원 정보가 있으면 가져오기
  if (posting.value?.is_applied) {
    await fetchApplicationInfo()
  } else {
    currentApplication.value = null
  }
}

const fetchApplicationInfo = async () => {
  const result = await applicationStore.fetchMyApplications({})
  if (result.success) {
    const application = applicationStore.applications.find(
      (app) => app.job_posting.id === postingId.value
    )
    currentApplication.value = application || null
  }
}

const handleApply = () => {
  if (posting.value.is_applied) {
    return
  }
  
  // 인증 상태 체크
  if (!user.value || user.value.verification_status !== 'approved') {
    showVerificationModal.value = true
    return
  }
  
  showApplyModal.value = true
}

const goToVerification = () => {
  showVerificationModal.value = false
  router.push('/verification')
}

const confirmApply = async () => {
  applying.value = true
  try {
  const result = await applicationStore.createApplication(postingId.value)

  if (result.success) {
      // 성공 시 모달 닫기
      showApplyModal.value = false
    showToast('지원이 완료되었습니다', 'success')
      
      // 공고 정보 새로고침 (is_applied 상태 업데이트)
      await fetchPosting()
      
      // 지원 현황 페이지로 이동
    router.push({ name: 'MyApplications' })
  } else {
      // 403 에러인 경우 인증 필요 모달 표시
      if (result.status === 403) {
        showApplyModal.value = false
        showVerificationModal.value = true
      } else {
        // 실패 시 에러 메시지 표시
        const errorMessage = result.error || '지원 처리 중 오류가 발생했습니다'
        showToast(errorMessage, 'error')
        // 모달은 열어둠 (사용자가 다시 시도할 수 있도록)
      }
    }
  } catch (error) {
    // 예상치 못한 에러 처리
    console.error('Application error:', error)
    showToast('지원 처리 중 오류가 발생했습니다', 'error')
  } finally {
    applying.value = false
  }
}

const handleCancel = () => {
  if (!posting.value?.is_applied) {
    return
  }
  showCancelModal.value = true
}

const confirmCancel = async () => {
  // 현재 지원 정보 찾기
  if (!currentApplication.value) {
    const myApplications = await applicationStore.fetchMyApplications({})
    if (!myApplications.success) {
      if (showToast && typeof showToast === 'function') {
        showToast('지원 정보를 불러오는데 실패했습니다', 'error')
      }
      return
    }
    
    const application = applicationStore.applications.find(
      (app) => app.job_posting.id === postingId.value
    )
    
    if (!application) {
      if (showToast && typeof showToast === 'function') {
        showToast('지원 정보를 찾을 수 없습니다', 'error')
      }
      showCancelModal.value = false
      return
    }
    currentApplication.value = application
  }
  
  cancelling.value = true
  try {
    const result = await applicationStore.cancelApplication(currentApplication.value.id)
    
    if (result.success) {
      // 성공 시 모달 닫기
      showCancelModal.value = false
      if (showToast && typeof showToast === 'function') {
        showToast('지원이 취소되었습니다', 'success')
      }
      
      // 공고 정보 새로고침 (is_applied 상태 업데이트)
      await fetchPosting()
      // 지원 정보도 새로고침
      await fetchApplicationInfo()
    } else {
      // 실패 시 에러 메시지 표시
      const errorMessage = result.error || '지원 취소 중 오류가 발생했습니다'
      if (showToast && typeof showToast === 'function') {
        showToast(errorMessage, 'error')
      }
    }
  } catch (error) {
    // 예상치 못한 에러 처리
    console.error('Cancel application error:', error)
    if (showToast && typeof showToast === 'function') {
      showToast('지원 취소 중 오류가 발생했습니다', 'error')
    }
  } finally {
    cancelling.value = false
  }
}

const viewAcademyProfile = () => {
  if (posting.value?.academy?.id) {
    router.push({
      name: 'AcademyProfile',
      params: { id: posting.value.academy.id },
    })
  }
}

const contactAcademy = () => {
  showToast('학원 연락처는 채용 확정 시 공개됩니다', 'info')
}

const writeReview = () => {
  if (currentApplication.value) {
    router.push({
      name: 'ReviewWrite',
      params: { applicationId: currentApplication.value.id.toString() },
    })
  }
}

const editReview = () => {
  if (currentApplication.value?.review_id) {
    router.push({
      name: 'ReviewEdit',
      params: { id: currentApplication.value.review_id.toString() },
    })
  }
}

const formatSalary = (posting) => {
  if (posting.salary_type === 'hourly') {
    return `${posting.salary.toLocaleString()}원/시간`
  } else {
    return `${posting.salary.toLocaleString()}원/월`
  }
}

onMounted(async () => {
  await fetchPosting()
  // 사용자 정보가 없으면 로드
  if (!user.value) {
    await authStore.fetchCurrentUser()
  }
})
</script>

<style scoped>
.job-posting-detail {
  padding: var(--spacing-lg);
}

.academy-section {
  margin-bottom: var(--spacing-lg);
}

.academy-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.academy-rating {
  margin-bottom: var(--spacing-sm);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.academy-location {
  margin-bottom: var(--spacing-lg);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.posting-section {
  margin-bottom: var(--spacing-lg);
}

.posting-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: var(--spacing-xl);
  color: var(--color-text-primary);
}

.posting-details {
  margin-bottom: var(--spacing-xl);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-divider);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
  min-width: 100px;
}

.detail-value {
  font-size: 14px;
  color: var(--color-text-primary);
  text-align: right;
  flex: 1;
}

.detail-value.salary {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-accent);
}

.description-section {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-divider);
}

.description-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.description-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-primary);
  white-space: pre-wrap;
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

.cancel-confirm {
  padding: var(--spacing-md);
  text-align: center;
}

.cancel-confirm p {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 16px;
  color: var(--color-text-primary);
}

.cancel-warning {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.verification-notice {
  padding: var(--spacing-md);
}

.verification-notice p {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 16px;
  color: var(--color-text-primary);
  line-height: 1.6;
}

.verification-notice strong {
  color: var(--color-error);
}

.verification-message {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.verification-status {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--radius-sm);
}

.verification-status p {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
