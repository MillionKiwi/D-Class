<template>
  <AppLayout>
    <div class="hired-page page-container">
      <div class="page-header">
        <h1 class="page-title">채용 현황</h1>
      </div>

      <div v-if="loading && hiredInstructors.length === 0" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else-if="hiredInstructors.length > 0" class="hired-list">
        <Card v-for="instructor in hiredInstructors" :key="instructor.id" class="hired-card">
          <div class="instructor-header">
            <div class="instructor-avatar">
              <img
                v-if="instructor.profile_image"
                :src="instructor.profile_image"
                alt="프로필"
              />
              <div v-else class="avatar-placeholder">👤</div>
            </div>
            <div class="instructor-info">
              <h3 class="instructor-name">
                {{ instructor.name }}
                <Badge v-if="instructor.is_verified" variant="success" small>✓</Badge>
              </h3>
              <p class="instructor-specialties">{{ formatGenres(instructor.specialties) || '-' }}</p>
            </div>
          </div>

          <div class="hiring-info">
            <p class="hiring-date">채용 확정일: {{ formatDate(instructor.hired_date) }}</p>
            <p v-if="instructor.job_title" class="job-title">담당: {{ instructor.job_title }}</p>
          </div>

          <div class="action-section">
            <Button
              v-if="!instructor.has_reviewed"
              variant="secondary"
              @click="writeReview(instructor)"
            >
              리뷰 작성하기
            </Button>
            <Button variant="text" @click="viewProfile(instructor)">프로필 보기</Button>
          </div>
        </Card>
      </div>

      <div v-else class="empty-state">
        <p>아직 채용 확정된 강사가 없습니다</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/services/api'
import { API_ENDPOINTS } from '@/config/api'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { formatGenres } from '@/utils/formatters'

const router = useRouter()
const showToast = inject('toast')

const hiredInstructors = ref([])
const loading = ref(false)

const fetchHiredInstructors = async () => {
  loading.value = true
  try {
    // 채용 확정된 강사 목록은 지원자 목록에서 accepted 상태로 필터링
    const response = await apiClient.get(API_ENDPOINTS.APPLICATIONS.LIST, {
      params: { status: 'accepted' },
    })
    // 응답에서 강사 정보 추출 (실제 API 응답 구조에 맞게 수정 필요)
    hiredInstructors.value = response.data.results.map((app) => ({
      ...app.instructor,
      hired_date: app.created_at,
      application_id: app.id,
      has_reviewed: false, // 실제로는 리뷰 작성 여부 확인 필요
    }))
  } catch (error) {
    showToast('채용 현황을 불러오는데 실패했습니다', 'error')
  } finally {
    loading.value = false
  }
}

const writeReview = (instructor) => {
  router.push({
    name: 'ReviewWrite',
    params: { applicationId: instructor.application_id },
  })
}

const viewProfile = (instructor) => {
  router.push(`/instructors/${instructor.id}`)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

onMounted(() => {
  fetchHiredInstructors()
})
</script>

<style scoped>
.hired-page {
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

.hired-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.hired-card {
  padding: var(--spacing-lg);
}

.instructor-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
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

.instructor-info {
  flex: 1;
}

.instructor-name {
  font-size: 18px;
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

.hiring-info {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-background);
  border-radius: var(--radius-sm);
}

.hiring-date,
.job-title {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.action-section {
  display: flex;
  gap: var(--spacing-sm);
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
