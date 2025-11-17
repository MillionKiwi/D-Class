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
            <span class="detail-value">{{ posting.genres.join(', ') }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">담당 수업</span>
            <span class="detail-value">{{ posting.classes || '-' }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">근무 요일</span>
            <span class="detail-value">{{ posting.work_days.join(', ') }}</span>
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
          :disabled="posting.is_applied"
          :loading="applying"
          @click="handleApply"
        >
          {{ posting.is_applied ? '지원 완료' : '지원하기' }}
        </Button>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>공고를 찾을 수 없습니다</p>
      <Button @click="$router.push('/home')">목록으로 돌아가기</Button>
    </div>

    <!-- 지원 확인 모달 -->
    <Modal v-model:visible="showApplyModal" title="지원 확인" @close="showApplyModal = false">
      <p>이 공고에 지원하시겠습니까?</p>
      <template #footer>
        <Button variant="secondary" @click="showApplyModal = false">취소</Button>
        <Button @click="confirmApply">지원하기</Button>
      </template>
    </Modal>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobPostingStore } from '@/stores/jobPosting'
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
const jobPostingStore = useJobPostingStore()
const applicationStore = useApplicationStore()
const showToast = inject('toast')

const postingId = computed(() => parseInt(route.params.id))
const posting = computed(() => jobPostingStore.currentPosting)
const loading = computed(() => jobPostingStore.loading)
const applying = ref(false)
const showApplyModal = ref(false)

const fetchPosting = async () => {
  const result = await jobPostingStore.fetchPostingDetail(postingId.value)
  if (!result.success) {
    showToast('공고를 불러오는데 실패했습니다', 'error')
  }
}

const handleApply = () => {
  if (posting.value.is_applied) {
    return
  }
  showApplyModal.value = true
}

const confirmApply = async () => {
  applying.value = true
  const result = await applicationStore.createApplication(postingId.value)
  applying.value = false

  if (result.success) {
    showToast('지원이 완료되었습니다', 'success')
    showApplyModal.value = false
    await fetchPosting() // 공고 정보 새로고침
  } else {
    showToast(result.error || '지원 처리 중 오류가 발생했습니다', 'error')
  }
}

const viewAcademyProfile = () => {
  if (posting.value?.academy?.id) {
    router.push(`/academies/${posting.value.academy.id}`)
  }
}

const contactAcademy = () => {
  showToast('학원 연락처는 채용 확정 시 공개됩니다', 'info')
}

const formatSalary = (posting) => {
  if (posting.salary_type === 'hourly') {
    return `${posting.salary.toLocaleString()}원/시간`
  } else {
    return `${posting.salary.toLocaleString()}원/월`
  }
}

onMounted(() => {
  fetchPosting()
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
</style>
