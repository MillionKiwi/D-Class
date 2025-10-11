<template>
  <AdminLayout>
    <div class="job-management">
      <!-- 검색 및 필터 -->
      <div class="job-management__filters">
        <div class="filter-row">
          <!-- 검색 -->
          <div class="search-box">
            <SearchIcon :size="20" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="공고 제목, 학원명으로 검색"
              @input="handleSearch"
            />
          </div>

          <!-- 필터 -->
          <div class="filter-group">
            <select v-model="filters.status" class="filter-select" @change="handleFilterChange">
              <option value="">상태: 전체</option>
              <option value="pending">검토 대기</option>
              <option value="active">게시중</option>
              <option value="closed">마감</option>
              <option value="hidden">숨김</option>
            </select>

            <input
              v-model="filters.dateFrom"
              type="date"
              class="filter-select"
              @change="handleFilterChange"
            />
            <input
              v-model="filters.dateTo"
              type="date"
              class="filter-select"
              @change="handleFilterChange"
            />
          </div>
        </div>
      </div>

      <!-- 공고 목록 테이블 -->
      <div class="job-management__table">
        <table v-if="!isLoading && jobs.length > 0">
          <thead>
            <tr>
              <th>공고 제목</th>
              <th>학원명</th>
              <th>장르</th>
              <th>급여</th>
              <th>등록일</th>
              <th>상태</th>
              <th>지원자 수</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in jobs" :key="job.id">
              <td>
                <button class="title-link" @click="showJobDetail(job)">
                  {{ job.title }}
                </button>
              </td>
              <td>{{ job.academyName }}</td>
              <td class="genres">{{ job.genres.join(', ') }}</td>
              <td class="salary">{{ formatSalary(job.salary, job.salaryType) }}</td>
              <td>{{ formatDate(job.createdAt, 'YYYY.MM.DD') }}</td>
              <td>
                <BaseBadge :variant="getStatusVariant(job.status)">
                  {{ getStatusText(job.status) }}
                </BaseBadge>
              </td>
              <td>
                <BaseBadge v-if="job.applicantCount > 0" variant="primary" dot>
                  {{ job.applicantCount }}
                </BaseBadge>
                <span v-else class="zero-count">0</span>
              </td>
              <td>
                <div class="action-buttons">
                  <BaseButton
                    v-if="job.status === 'pending'"
                    variant="secondary"
                    @click="approveJob(job)"
                  >
                    승인
                  </BaseButton>
                  <BaseButton
                    v-if="job.status === 'active'"
                    variant="secondary"
                    @click="handleHide(job)"
                  >
                    숨기기
                  </BaseButton>
                  <BaseButton variant="danger" @click="handleDelete(job)">삭제</BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 로딩 -->
        <BaseLoading v-if="isLoading" type="skeleton" inline :lines="8" />

        <!-- 빈 상태 -->
        <BaseEmptyState
          v-if="!isLoading && jobs.length === 0"
          title="공고가 없습니다"
          description="검색 조건을 변경해보세요"
        />
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="job-management__pagination">
        <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">이전</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">다음</button>
      </div>

      <!-- 공고 상세 모달 -->
      <BaseModal
        v-model:isOpen="showDetailModal"
        :title="selectedJob?.title || '공고 상세'"
        size="large"
        :showFooter="false"
      >
        <div v-if="selectedJob" class="job-detail">
          <div class="detail-section">
            <h4>학원 정보</h4>
            <p><strong>학원명:</strong> {{ selectedJob.academyName }}</p>
            <p><strong>연락처:</strong> {{ selectedJob.academyPhone }}</p>
          </div>

          <div class="detail-section">
            <h4>모집 정보</h4>
            <p><strong>장르:</strong> {{ selectedJob.genres.join(', ') }}</p>
            <p><strong>담당 수업:</strong> {{ selectedJob.classes }}</p>
            <p><strong>급여:</strong> {{ formatSalary(selectedJob.salary, selectedJob.salaryType) }}</p>
          </div>

          <div class="detail-section">
            <h4>상세 설명</h4>
            <p class="description">{{ selectedJob.description }}</p>
          </div>
        </div>
      </BaseModal>

      <!-- 숨기기 확인 모달 -->
      <BaseModal
        v-model:isOpen="showHideModal"
        title="공고 숨기기"
        confirmText="숨기기"
        @confirm="confirmHide"
        @cancel="showHideModal = false"
      >
        <p>게시를 중단하시겠습니까?</p>
        <div class="hide-form">
          <BaseInput
            v-model="hideReason"
            label="숨김 사유"
            textarea
            :rows="3"
            placeholder="숨김 사유를 입력하세요 (학원에 전달됩니다)"
            required
          />
        </div>
      </BaseModal>

      <!-- 삭제 확인 모달 -->
      <BaseModal
        v-model:isOpen="showDeleteModal"
        title="공고 삭제"
        confirmText="삭제"
        @confirm="confirmDelete"
        @cancel="showDeleteModal = false"
      >
        <p><strong>삭제된 공고는 복구할 수 없습니다.</strong></p>
        <p>정말 삭제하시겠습니까?</p>
        <div class="delete-form">
          <BaseInput
            v-model="deletePassword"
            type="password"
            label="관리자 비밀번호 확인"
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>
      </BaseModal>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search as SearchIcon } from 'lucide-vue-next'
import { AdminLayout } from '@/components/layout'
import { BaseButton, BaseBadge, BaseModal, BaseLoading, BaseEmptyState, BaseInput } from '@/components/common'
import { formatDate, formatSalary, debounce } from '@/utils/helpers'
import { JOB_STATUS } from '@/utils/constants'
import { useToast } from '@/composables/useToast'
import { apiClient } from '@/api'

const { success, error: showError } = useToast()

const jobs = ref([])
const searchKeyword = ref('')
const filters = reactive({
  status: '',
  dateFrom: '',
  dateTo: '',
})

const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 30

const showDetailModal = ref(false)
const selectedJob = ref(null)

const showHideModal = ref(false)
const hideReason = ref('')

const showDeleteModal = ref(false)
const deletePassword = ref('')

const getStatusVariant = (status) => {
  const variants = {
    [JOB_STATUS.PENDING]: 'warning',
    [JOB_STATUS.ACTIVE]: 'success',
    [JOB_STATUS.CLOSED]: 'default',
    [JOB_STATUS.HIDDEN]: 'error',
  }
  return variants[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    [JOB_STATUS.PENDING]: '검토 대기',
    [JOB_STATUS.ACTIVE]: '게시중',
    [JOB_STATUS.CLOSED]: '마감',
    [JOB_STATUS.HIDDEN]: '숨김',
  }
  return texts[status] || status
}

const fetchJobs = async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get('/admin/jobs', {
      params: {
        page: currentPage.value,
        limit: pageSize,
        keyword: searchKeyword.value,
        ...filters,
      },
    })
    jobs.value = response.data.jobs
    totalPages.value = response.data.totalPages
  } catch (err) {
    showError('공고 목록을 불러오는데 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

const handleSearch = debounce(() => {
  currentPage.value = 1
  fetchJobs()
}, 500)

const handleFilterChange = () => {
  currentPage.value = 1
  fetchJobs()
}

const goToPage = (page) => {
  currentPage.value = page
  fetchJobs()
}

const showJobDetail = (job) => {
  selectedJob.value = job
  showDetailModal.value = true
}

const approveJob = async (job) => {
  if (!confirm('공고를 승인하시겠습니까?')) return

  try {
    await apiClient.patch(`/admin/jobs/${job.id}/approve`)
    
    const foundJob = jobs.value.find((j) => j.id === job.id)
    if (foundJob) {
      foundJob.status = JOB_STATUS.ACTIVE
    }

    success('공고가 승인되었습니다.')
  } catch (err) {
    showError('공고 승인에 실패했습니다.')
  }
}

const handleHide = (job) => {
  selectedJob.value = job
  hideReason.value = ''
  showHideModal.value = true
}

const confirmHide = async () => {
  if (!hideReason.value) {
    showError('숨김 사유를 입력해주세요')
    return
  }

  try {
    await apiClient.patch(`/admin/jobs/${selectedJob.value.id}/hide`, {
      reason: hideReason.value,
    })
    
    const job = jobs.value.find((j) => j.id === selectedJob.value.id)
    if (job) {
      job.status = JOB_STATUS.HIDDEN
    }

    success('공고가 숨김 처리되었습니다.')
    showHideModal.value = false
  } catch (err) {
    showError('공고 숨김 처리에 실패했습니다.')
  }
}

const handleDelete = (job) => {
  selectedJob.value = job
  deletePassword.value = ''
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deletePassword.value) {
    showError('비밀번호를 입력해주세요')
    return
  }

  try {
    await apiClient.delete(`/admin/jobs/${selectedJob.value.id}`, {
      data: { password: deletePassword.value },
    })
    
    jobs.value = jobs.value.filter((j) => j.id !== selectedJob.value.id)

    success('공고가 삭제되었습니다.')
    showDeleteModal.value = false
  } catch (err) {
    showError(err.response?.data?.message || '공고 삭제에 실패했습니다.')
  }
}

onMounted(() => {
  fetchJobs()
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.job-management {
  &__filters {
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;
    padding: $spacing-xl;
    margin-bottom: $spacing-lg;

    .filter-row {
      display: flex;
      flex-direction: column;
      gap: $spacing-lg;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      padding: 0 $spacing-md;
      height: $input-height;
      border: 1px solid $color-divider;
      border-radius: $radius-md;
      background-color: $color-white;

      &:focus-within {
        border-color: $color-primary;
        border-width: 2px;
      }

      input {
        flex: 1;
        border: none;
        outline: none;
        font-size: $font-size-body;
        color: $color-text-primary;

        &::placeholder {
          color: $color-text-secondary;
        }
      }
    }

    .filter-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: $spacing-md;
    }

    .filter-select {
      height: 40px;
      padding: 0 $spacing-md;
      border: 1px solid $color-divider;
      border-radius: $radius-md;
      background-color: $color-white;
      font-size: $font-size-body-small;
      color: $color-text-primary;
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: $color-primary;
      }
    }
  }

  &__table {
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;
    overflow: hidden;

    table {
      width: 100%;
      border-collapse: collapse;

      thead {
        background-color: $color-background;
        position: sticky;
        top: 0;

        th {
          text-align: left;
          padding: $spacing-lg;
          font-size: $font-size-body-small;
          font-weight: $font-weight-semibold;
          color: $color-text-secondary;
          border-bottom: 2px solid $color-divider;
          white-space: nowrap;
        }
      }

      tbody {
        tr {
          border-bottom: 1px solid $color-divider;
          transition: background-color $transition-fast;

          &:hover {
            background-color: $color-background;
          }
        }

        td {
          padding: $spacing-lg;
          font-size: $font-size-body-small;
          color: $color-text-primary;

          &.genres {
            color: $color-text-secondary;
            max-width: 150px;
            @include text-ellipsis(1);
          }

          &.salary {
            font-weight: $font-weight-semibold;
            color: $color-primary;
          }
        }
      }
    }

    .title-link {
      background: none;
      border: none;
      color: $color-primary;
      font-weight: $font-weight-semibold;
      cursor: pointer;
      text-align: left;
      transition: color $transition-fast;

      &:hover {
        color: $color-primary-dark;
        text-decoration: underline;
      }
    }

    .zero-count {
      color: $color-text-secondary;
      font-size: $font-size-body-small;
    }

    .action-buttons {
      display: flex;
      gap: $spacing-xs;
      flex-wrap: wrap;
    }
  }

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-lg;
    margin-top: $spacing-lg;

    button {
      padding: $spacing-sm $spacing-lg;
      border: 1px solid $color-divider;
      border-radius: $radius-md;
      background-color: $color-white;
      color: $color-text-primary;
      cursor: pointer;
      transition: all $transition-fast;

      &:hover:not(:disabled) {
        border-color: $color-primary;
        color: $color-primary;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .page-info {
      font-size: $font-size-body;
      color: $color-text-primary;
      font-weight: $font-weight-medium;
    }
  }
}

.job-detail {
  .detail-section {
    margin-bottom: $spacing-xl;

    &:last-child {
      margin-bottom: 0;
    }

    h4 {
      font-size: $font-size-h3;
      font-weight: $font-weight-semibold;
      margin: 0 0 $spacing-lg 0;
      padding-bottom: $spacing-sm;
      border-bottom: 2px solid $color-divider;
    }

    p {
      margin: $spacing-sm 0;
      color: $color-text-primary;
    }

    .description {
      white-space: pre-line;
      line-height: $line-height-relaxed;
    }
  }
}

.hide-form,
.delete-form {
  margin-top: $spacing-lg;
}
</style>

