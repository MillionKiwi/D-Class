<template>
  <AdminLayout>
    <div class="member-management">
      <!-- 검색 및 필터 영역 -->
      <div class="member-management__filters">
        <div class="filter-row">
          <!-- 검색 -->
          <div class="search-box">
            <SearchIcon :size="20" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="이름, 이메일로 검색"
              @input="handleSearch"
            />
          </div>

          <!-- 필터 -->
          <div class="filter-group">
            <select v-model="filters.userType" class="filter-select" @change="handleFilterChange">
              <option value="">회원 유형: 전체</option>
              <option value="instructor">강사</option>
              <option value="academy">학원</option>
            </select>

            <select v-model="filters.verificationStatus" class="filter-select" @change="handleFilterChange">
              <option value="">인증 상태: 전체</option>
              <option value="unverified">미인증</option>
              <option value="pending">인증 대기</option>
              <option value="verified">인증 완료</option>
              <option value="rejected">인증 반려</option>
            </select>

            <select v-model="filters.accountStatus" class="filter-select" @change="handleFilterChange">
              <option value="">계정 상태: 전체</option>
              <option value="active">활성</option>
              <option value="suspended">정지</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 회원 목록 테이블 -->
      <div class="member-management__table">
        <table v-if="!isLoading && members.length > 0">
          <thead>
            <tr>
              <th>이름</th>
              <th>유형</th>
              <th>이메일</th>
              <th>가입일</th>
              <th>인증 상태</th>
              <th>계정 상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in members" :key="member.id">
              <td>
                <button class="name-link" @click="showMemberDetail(member)">
                  {{ member.name }}
                </button>
              </td>
              <td>
                <BaseBadge :variant="member.role === 'instructor' ? 'primary' : 'info'">
                  {{ member.role === 'instructor' ? '강사' : '학원' }}
                </BaseBadge>
              </td>
              <td class="email">{{ member.email }}</td>
              <td>{{ formatDate(member.createdAt, 'YYYY.MM.DD') }}</td>
              <td>
                <BaseBadge :variant="getVerificationVariant(member.verificationStatus)">
                  {{ getVerificationText(member.verificationStatus) }}
                </BaseBadge>
              </td>
              <td>
                <BaseBadge :variant="member.accountStatus === 'active' ? 'success' : 'error'">
                  {{ member.accountStatus === 'active' ? '활성' : '정지' }}
                </BaseBadge>
              </td>
              <td>
                <div class="action-buttons">
                  <BaseButton
                    v-if="member.accountStatus === 'active'"
                    variant="danger"
                    @click="handleSuspend(member)"
                  >
                    정지
                  </BaseButton>
                  <BaseButton
                    v-else
                    variant="secondary"
                    @click="handleRestore(member)"
                  >
                    복구
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 로딩 -->
        <BaseLoading v-if="isLoading" type="skeleton" inline :lines="8" />

        <!-- 빈 상태 -->
        <BaseEmptyState
          v-if="!isLoading && members.length === 0"
          title="회원이 없습니다"
          description="검색 조건을 변경해보세요"
        />
      </div>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="member-management__pagination">
        <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">이전</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">다음</button>
      </div>

      <!-- 회원 상세 모달 -->
      <BaseModal
        v-model:isOpen="showDetailModal"
        :title="selectedMember?.name || '회원 정보'"
        size="large"
        :showFooter="false"
      >
        <div v-if="selectedMember" class="member-detail">
          <div class="detail-section">
            <h4>기본 정보</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">유형</span>
                <span class="value">{{ selectedMember.role === 'instructor' ? '강사' : '학원' }}</span>
              </div>
              <div class="info-item">
                <span class="label">이메일</span>
                <span class="value">{{ selectedMember.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">연락처</span>
                <span class="value">{{ selectedMember.phone }}</span>
              </div>
              <div class="info-item">
                <span class="label">가입일</span>
                <span class="value">{{ formatDate(selectedMember.createdAt, 'YYYY.MM.DD HH:mm') }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedMember.role === 'instructor'" class="detail-section">
            <h4>전문 분야</h4>
            <div class="genre-tags">
              <BaseBadge v-for="genre in selectedMember.genres" :key="genre" variant="primary">
                {{ genre }}
              </BaseBadge>
            </div>
          </div>

          <div v-if="selectedMember.address" class="detail-section">
            <h4>주소</h4>
            <p>{{ selectedMember.address }}</p>
          </div>
        </div>
      </BaseModal>

      <!-- 계정 정지 모달 -->
      <BaseModal
        v-model:isOpen="showSuspendModal"
        title="계정 정지"
        confirmText="정지"
        @confirm="confirmSuspend"
        @cancel="showSuspendModal = false"
      >
        <p>해당 회원의 계정을 정지하시겠습니까?</p>
        <div class="suspend-form">
          <BaseInput
            v-model="suspendReason"
            label="정지 사유"
            textarea
            :rows="3"
            placeholder="정지 사유를 입력하세요"
            required
          />
        </div>
      </BaseModal>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search as SearchIcon } from 'lucide-vue-next'
import { AdminLayout } from '@/components/layout'
import { BaseButton, BaseBadge, BaseModal, BaseLoading, BaseEmptyState, BaseInput } from '@/components/common'
import { formatDate } from '@/utils/helpers'
import { debounce } from '@/utils/helpers'
import { useToast } from '@/composables/useToast'
import { apiClient } from '@/api'

const { success, error: showError } = useToast()

const members = ref([])
const searchKeyword = ref('')
const filters = reactive({
  userType: '',
  verificationStatus: '',
  accountStatus: '',
})

const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 30

const showDetailModal = ref(false)
const selectedMember = ref(null)

const showSuspendModal = ref(false)
const suspendReason = ref('')

const getVerificationVariant = (status) => {
  const variants = {
    unverified: 'warning',
    pending: 'info',
    verified: 'success',
    rejected: 'error',
  }
  return variants[status] || 'default'
}

const getVerificationText = (status) => {
  const texts = {
    unverified: '미인증',
    pending: '인증 대기',
    verified: '인증 완료',
    rejected: '인증 반려',
  }
  return texts[status] || status
}

const fetchMembers = async () => {
  isLoading.value = true
  try {
    const response = await apiClient.get('/admin/members', {
      params: {
        page: currentPage.value,
        limit: pageSize,
        keyword: searchKeyword.value,
        ...filters,
      },
    })
    members.value = response.data.members
    totalPages.value = response.data.totalPages
  } catch (err) {
    showError('회원 목록을 불러오는데 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

const handleSearch = debounce(() => {
  currentPage.value = 1
  fetchMembers()
}, 500)

const handleFilterChange = () => {
  currentPage.value = 1
  fetchMembers()
}

const goToPage = (page) => {
  currentPage.value = page
  fetchMembers()
}

const showMemberDetail = (member) => {
  selectedMember.value = member
  showDetailModal.value = true
}

const handleSuspend = (member) => {
  selectedMember.value = member
  suspendReason.value = ''
  showSuspendModal.value = true
}

const confirmSuspend = async () => {
  if (!suspendReason.value) {
    showError('정지 사유를 입력해주세요')
    return
  }

  try {
    await apiClient.patch(`/admin/members/${selectedMember.value.id}/suspend`, {
      reason: suspendReason.value,
    })
    
    const member = members.value.find((m) => m.id === selectedMember.value.id)
    if (member) {
      member.accountStatus = 'suspended'
    }

    success('계정이 정지되었습니다.')
    showSuspendModal.value = false
  } catch (err) {
    showError('계정 정지에 실패했습니다.')
  }
}

const handleRestore = async (member) => {
  if (!confirm('계정을 복구하시겠습니까?')) return

  try {
    await apiClient.patch(`/admin/members/${member.id}/restore`)
    
    const foundMember = members.value.find((m) => m.id === member.id)
    if (foundMember) {
      foundMember.accountStatus = 'active'
    }

    success('계정이 복구되었습니다.')
  } catch (err) {
    showError('계정 복구에 실패했습니다.')
  }
}

onMounted(() => {
  fetchMembers()
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.member-management {
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
        }
      }

      tbody {
        tr {
          border-bottom: 1px solid $color-divider;
          transition: background-color $transition-fast;

          &:hover {
            background-color: $color-background;
          }

          &:last-child {
            border-bottom: none;
          }
        }

        td {
          padding: $spacing-lg;
          font-size: $font-size-body;
          color: $color-text-primary;

          &.email {
            color: $color-text-secondary;
            font-size: $font-size-body-small;
          }
        }
      }
    }

    .name-link {
      background: none;
      border: none;
      color: $color-primary;
      font-weight: $font-weight-semibold;
      cursor: pointer;
      transition: color $transition-fast;

      &:hover {
        color: $color-primary-dark;
        text-decoration: underline;
      }
    }

    .action-buttons {
      display: flex;
      gap: $spacing-sm;
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

.member-detail {
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
      margin: 0;
      color: $color-text-primary;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-lg;

    @include mobile {
      grid-template-columns: 1fr;
    }
  }

  .info-item {
    .label {
      display: block;
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      margin-bottom: $spacing-xs;
    }

    .value {
      font-size: $font-size-body;
      color: $color-text-primary;
      font-weight: $font-weight-medium;
    }
  }

  .genre-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }
}

.suspend-form {
  margin-top: $spacing-lg;
}
</style>

