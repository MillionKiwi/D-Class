<template>
  <AppLayout>
    <div class="applications-page page-container">
      <div class="page-header">
        <h1 class="page-title">지원 현황</h1>
      </div>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab', { active: currentTab === tab.value }]"
          @click="currentTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="loading && applications.length === 0" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else-if="applications.length > 0" class="applications-list">
        <Card
          v-for="application in applications"
          :key="application.id"
          class="application-card"
          clickable
          @click="viewApplication(application)"
        >
          <div class="application-header">
            <h3 class="academy-name">
              {{ application.job_posting.academy.name }}
              <Badge v-if="application.job_posting.academy.is_verified" variant="success" small>
                ✓
              </Badge>
            </h3>
            <Badge :variant="getStatusBadgeVariant(application.status)">
              {{ getStatusLabel(application.status) }}
            </Badge>
          </div>

          <h4 class="posting-title">{{ application.job_posting.title }}</h4>

          <div class="application-footer">
            <span class="application-date">{{ formatDate(application.created_at) }}</span>
            <div class="application-actions">
            <Button
                v-if="application.status === 'accepted' && application.can_review !== false"
              variant="secondary"
              small
              @click.stop="writeReview(application)"
            >
              리뷰 작성하기
            </Button>
              <Button
                v-if="application.status === 'accepted' && application.can_review === false && application.review_id"
                variant="secondary"
                small
                @click.stop="editReview(application)"
              >
                리뷰 수정하기
              </Button>
              <Button
                v-if="canCancel(application.status)"
                variant="error"
                small
                @click.stop="handleCancel(application)"
              >
                지원 취소
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div v-else class="empty-state">
        <p>아직 지원한 공고가 없습니다</p>
        <Button @click="$router.push('/home')">공고 둘러보기</Button>
      </div>

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
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useApplicationStore } from '@/stores/application'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'

const router = useRouter()
const applicationStore = useApplicationStore()
const showToast = inject('toast', () => {})

const tabs = [
  { value: '', label: '전체' },
  { value: 'reviewing', label: '검토중' },
  { value: 'accepted', label: '최종합격' },
  { value: 'rejected', label: '불합격' },
]

const currentTab = ref('')
const showCancelModal = ref(false)
const cancelingApplication = ref(null)
const cancelling = ref(false)

// storeToRefs를 사용하여 반응성 유지하면서 구조 분해
const { applications: allApplications, loading } = storeToRefs(applicationStore)

// 탭에 따라 필터링된 지원 목록 (클라이언트 사이드 필터링)
const applications = computed(() => {
  if (!currentTab.value) {
    // 전체 탭: 모든 지원 반환
    return allApplications.value
  }
  // 특정 상태 탭: 상태에 맞는 지원만 필터링
  return allApplications.value.filter((app) => app.status === currentTab.value)
})

// 초기 데이터 로드 (한 번만 실행)
const fetchApplications = async () => {
  // status 파라미터 없이 전체 데이터 가져오기
  const result = await applicationStore.fetchMyApplications({})
  if (result.success) {
    // 디버깅: can_review 필드 확인
    console.log('Applications loaded:', allApplications.value.map(app => ({
      id: app.id,
      status: app.status,
      can_review: app.can_review,
      canWriteReview: app.status === 'accepted' && (app.can_review === true || app.can_review === undefined)
    })))
  }
}

const viewApplication = (application) => {
  router.push(`/job-postings/${application.job_posting.id}`)
}

const writeReview = (application) => {
  router.push({
    name: 'ReviewWrite',
    params: { applicationId: application.id.toString() },
  })
}

const editReview = (application) => {
  if (application.review_id) {
    router.push({
      name: 'ReviewEdit',
      params: { id: application.review_id.toString() },
    })
  }
}

const canCancel = (status) => {
  // 채용 확정된 지원은 취소할 수 없음
  return status !== 'accepted'
}

// canWriteReview 함수는 더 이상 사용하지 않음 (템플릿에서 직접 조건 체크)

const handleCancel = (application) => {
  cancelingApplication.value = application
  showCancelModal.value = true
}

const confirmCancel = async () => {
  if (!cancelingApplication.value) return
  
  cancelling.value = true
  try {
    const result = await applicationStore.cancelApplication(cancelingApplication.value.id)
    
    if (result.success) {
      showCancelModal.value = false
      cancelingApplication.value = null
      showToast('지원이 취소되었습니다', 'success')
      // 목록 새로고침
      await fetchApplications()
    } else {
      const errorMessage = result.error || '지원 취소 중 오류가 발생했습니다'
      showToast(errorMessage, 'error')
    }
  } catch (error) {
    console.error('Cancel application error:', error)
    showToast('지원 취소 중 오류가 발생했습니다', 'error')
  } finally {
    cancelling.value = false
  }
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '지원 완료',
    reviewing: '검토중',
    accepted: '최종합격',
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

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

// 컴포넌트 마운트 시 한 번만 데이터 로드
onMounted(() => {
  // 스토어에 이미 데이터가 있으면 다시 요청하지 않음 (선택적)
  if (allApplications.value.length === 0) {
    fetchApplications()
  }
})
</script>

<style scoped>
.applications-page {
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--color-divider);
}

.tab {
  padding: var(--spacing-md) var(--spacing-lg);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: var(--color-text-primary);
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.application-card {
  padding: var(--spacing-lg);
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.academy-name {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.posting-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.application-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-divider);
}

.application-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.application-date {
  font-size: 12px;
  color: var(--color-text-secondary);
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
</style>
