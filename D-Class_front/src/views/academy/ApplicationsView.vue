<template>
  <AppLayout>
    <div class="applications-page page-container">
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
          @click="$router.push(`/academy/applications/${application.id}`)"
        >
          <div class="application-header">
            <div class="instructor-info">
              <div class="instructor-avatar">
                <img
                  v-if="application.instructor.profile_image"
                  :src="application.instructor.profile_image"
                  alt="프로필"
                />
                <div v-else class="avatar-placeholder">👤</div>
              </div>
              <div class="instructor-details">
                <h3 class="instructor-name">
                  {{ application.instructor.name }}
                  <Badge v-if="application.instructor.is_verified" variant="success" small>
                    ✓
                  </Badge>
                </h3>
                <p class="instructor-specialties">
                  {{ application.instructor.specialties?.join(', ') || '-' }}
                </p>
              </div>
            </div>
            <div class="application-badges">
              <Badge v-if="application.is_new" variant="error" small>NEW</Badge>
              <Badge :variant="getStatusBadgeVariant(application.status)">
                {{ getStatusLabel(application.status) }}
              </Badge>
            </div>
          </div>

          <div class="application-footer">
            <span class="application-date">{{ formatDate(application.created_at) }}</span>
            <span class="posting-title">{{ application.job_posting.title }}</span>
          </div>
        </Card>
      </div>

      <div v-else class="empty-state">
        <p>아직 지원자가 없습니다</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useApplicationStore } from '@/stores/application'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const applicationStore = useApplicationStore()

const tabs = [
  { value: '', label: '전체' },
  { value: 'new', label: '새 지원' },
  { value: 'reviewing', label: '검토중' },
  { value: 'accepted', label: '채용 확정' },
  { value: 'rejected', label: '불합격' },
]

const currentTab = ref('')

const { applications, loading } = applicationStore

const fetchApplications = async () => {
  const params = {}
  if (currentTab.value) {
    params.status = currentTab.value === 'new' ? 'pending' : currentTab.value
  }
  await applicationStore.fetchApplications(params)
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

.tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--color-divider);
  overflow-x: auto;
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
  white-space: nowrap;
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

.instructor-info {
  display: flex;
  gap: var(--spacing-md);
  flex: 1;
}

.instructor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-divider);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.instructor-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 30px;
}

.instructor-details {
  flex: 1;
}

.instructor-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.instructor-specialties {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.application-badges {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  align-items: flex-end;
}

.application-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-divider);
  font-size: 12px;
  color: var(--color-text-secondary);
}

.posting-title {
  font-weight: 500;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
