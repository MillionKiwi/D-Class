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
            <Button
              v-if="application.status === 'accepted' && application.can_review"
              variant="secondary"
              small
              @click.stop="writeReview(application)"
            >
              리뷰 작성하기
            </Button>
          </div>
        </Card>
      </div>

      <div v-else class="empty-state">
        <p>아직 지원한 공고가 없습니다</p>
        <Button @click="$router.push('/home')">공고 둘러보기</Button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useApplicationStore } from '@/stores/application'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const applicationStore = useApplicationStore()

const tabs = [
  { value: '', label: '전체' },
  { value: 'reviewing', label: '검토중' },
  { value: 'accepted', label: '최종합격' },
  { value: 'rejected', label: '불합격' },
]

const currentTab = ref('')

const { applications, loading } = applicationStore

const fetchApplications = async () => {
  const params = {}
  if (currentTab.value) {
    params.status = currentTab.value
  }
  await applicationStore.fetchMyApplications(params)
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

watch(currentTab, () => {
  fetchApplications()
})

onMounted(() => {
  fetchApplications()
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
</style>
