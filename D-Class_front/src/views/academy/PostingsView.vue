<template>
  <AppLayout show-add-posting>
    <div class="postings-page page-container">
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

      <div v-if="loading && myPostings.length === 0" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else-if="myPostings.length > 0" class="postings-list">
        <Card
          v-for="posting in myPostings"
          :key="posting.id"
          class="posting-card"
          clickable
          @click="$router.push(`/academy/postings/${posting.id}`)"
        >
          <div class="posting-header">
            <h3 class="posting-title">{{ posting.title }}</h3>
            <Badge :variant="getStatusBadgeVariant(posting.status)">
              {{ getStatusLabel(posting.status) }}
            </Badge>
          </div>

          <div class="posting-info">
            <span class="info-item">🎭 {{ posting.genres?.join(', ') || '-' }}</span>
            <span class="info-item">💰 {{ formatSalary(posting) }}</span>
          </div>

          <div class="posting-footer">
            <div class="posting-meta">
              <span class="application-count">
                지원자: <strong>{{ posting.application_count || 0 }}명</strong>
              </span>
              <span class="posting-date">{{ formatDate(posting.created_at) }}</span>
            </div>
            <div class="posting-actions">
              <Button
                v-if="posting.status === 'active'"
                variant="secondary"
                small
                @click.stop="handleClose(posting.id)"
              >
                마감
              </Button>
              <Button variant="secondary" small @click.stop="handleEdit(posting.id)">
                수정
              </Button>
              <Button variant="error" small @click.stop="handleDelete(posting.id)">
                삭제
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div v-else class="empty-state">
        <p>등록된 공고가 없습니다</p>
        <Button @click="$router.push('/academy/postings/new')">첫 공고 등록하기</Button>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <Modal v-model:visible="showDeleteModal" title="공고 삭제" @close="showDeleteModal = false">
      <p>삭제된 공고는 복구할 수 없습니다. 정말 삭제하시겠습니까?</p>
      <template #footer>
        <Button variant="secondary" @click="showDeleteModal = false">취소</Button>
        <Button variant="error" @click="confirmDelete">삭제</Button>
      </template>
    </Modal>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useJobPostingStore } from '@/stores/jobPosting'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'

const router = useRouter()
const jobPostingStore = useJobPostingStore()
const showToast = inject('toast')

const tabs = [
  { value: '', label: '전체' },
  { value: 'active', label: '게시중' },
  { value: 'pending', label: '검토 대기' },
  { value: 'closed', label: '마감' },
]

const currentTab = ref('')
const showDeleteModal = ref(false)
const deleteTargetId = ref(null)

const { myPostings, loading } = jobPostingStore

const fetchPostings = async () => {
  const params = {}
  if (currentTab.value) {
    params.status = currentTab.value
  }
  const result = await jobPostingStore.fetchMyPostings(params)
  if (!result.success) {
    showToast('공고를 불러오는데 실패했습니다', 'error')
  }
}

const handleEdit = (id) => {
  router.push(`/academy/postings/${id}/edit`)
}

const handleClose = async (id) => {
  if (confirm('공고를 마감하시겠습니까?')) {
    const result = await jobPostingStore.closePosting(id)
    if (result.success) {
      showToast('공고가 마감되었습니다', 'success')
      await fetchPostings()
    } else {
      showToast(result.error || '공고 마감에 실패했습니다', 'error')
    }
  }
}

const handleDelete = (id) => {
  deleteTargetId.value = id
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  const result = await jobPostingStore.deletePosting(deleteTargetId.value)
  if (result.success) {
    showToast('공고가 삭제되었습니다', 'success')
    showDeleteModal.value = false
    await fetchPostings()
  } else {
    showToast(result.error || '공고 삭제에 실패했습니다', 'error')
  }
}

const getStatusLabel = (status) => {
  const labels = {
    draft: '작성중',
    pending: '검토 대기',
    active: '게시중',
    closed: '마감',
    hidden: '숨김',
  }
  return labels[status] || status
}

const getStatusBadgeVariant = (status) => {
  const variants = {
    active: 'success',
    pending: 'warning',
    closed: 'disabled',
    hidden: 'error',
  }
  return variants[status] || 'info'
}

const formatSalary = (posting) => {
  if (!posting.salary) return '-'
  if (posting.salary_type === 'hourly') {
    return `${posting.salary.toLocaleString()}원/시간`
  } else {
    return `${posting.salary.toLocaleString()}원/월`
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

watch(currentTab, () => {
  fetchPostings()
})

onMounted(() => {
  fetchPostings()
})
</script>

<style scoped>
.postings-page {
  padding: var(--spacing-lg);
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

.postings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.posting-card {
  padding: var(--spacing-lg);
}

.posting-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.posting-title {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
}

.posting-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.posting-footer {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-divider);
}

.posting-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  font-size: 14px;
}

.application-count {
  color: var(--color-text-primary);
}

.posting-date {
  color: var(--color-text-secondary);
  font-size: 12px;
}

.posting-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
