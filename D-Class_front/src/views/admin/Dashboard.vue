<template>
  <AdminLayout>
    <div class="dashboard">
      <!-- 헤더 -->
      <div class="dashboard__header">
        <h1>대시보드</h1>
        <p class="last-updated">최종 업데이트: {{ lastUpdated }}</p>
      </div>

      <!-- 통계 카드 -->
      <div class="dashboard__stats">
        <BaseCard class="stat-card" clickable @click="$router.push('/admin/members')">
          <div class="stat-card__content">
            <div class="stat-icon" style="background-color: rgba(99, 102, 241, 0.1)">
              <UsersIcon :size="24" style="color: #6366f1" />
            </div>
            <div class="stat-info">
              <p class="stat-label">전체 회원</p>
              <h3 class="stat-value">{{ stats.totalMembers }}</h3>
              <p class="stat-change" :class="{ positive: stats.memberChange > 0 }">
                <span>{{ stats.memberChange > 0 ? '+' : '' }}{{ stats.memberChange }}</span>
                <span class="period">이번 주</span>
              </p>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card" clickable @click="$router.push('/admin/jobs')">
          <div class="stat-card__content">
            <div class="stat-icon" style="background-color: rgba(16, 185, 129, 0.1)">
              <BriefcaseIcon :size="24" style="color: #10b981" />
            </div>
            <div class="stat-info">
              <p class="stat-label">진행 중인 공고</p>
              <h3 class="stat-value">{{ stats.activeJobs }}</h3>
              <p class="stat-change" :class="{ positive: stats.jobChange > 0 }">
                <span>{{ stats.jobChange > 0 ? '+' : '' }}{{ stats.jobChange }}</span>
                <span class="period">이번 주</span>
              </p>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card" clickable @click="$router.push('/admin/verifications')">
          <div class="stat-card__content">
            <div class="stat-icon" style="background-color: rgba(245, 158, 11, 0.1)">
              <ShieldCheckIcon :size="24" style="color: #f59e0b" />
            </div>
            <div class="stat-info">
              <p class="stat-label">대기 중인 인증</p>
              <h3 class="stat-value">{{ stats.pendingVerifications }}</h3>
              <p v-if="stats.pendingVerifications > 0" class="stat-urgent">
                확인 필요
              </p>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card" clickable @click="$router.push('/admin/inquiries')">
          <div class="stat-card__content">
            <div class="stat-icon" style="background-color: rgba(239, 68, 68, 0.1)">
              <AlertCircleIcon :size="24" style="color: #ef4444" />
            </div>
            <div class="stat-info">
              <p class="stat-label">미처리 문의/신고</p>
              <h3 class="stat-value">{{ stats.pendingInquiries }}</h3>
              <p v-if="stats.pendingInquiries > 0" class="stat-urgent">
                답변 필요
              </p>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- 최근 활동 -->
      <section class="dashboard__section">
        <div class="section-header">
          <h2>최근 활동</h2>
          <BaseButton variant="text" @click="$router.push('/admin/members')">
            전체보기
          </BaseButton>
        </div>

        <div v-if="recentActivities.length > 0" class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="`type-${activity.type}`">
              <component :is="getActivityIcon(activity.type)" :size="20" />
            </div>
            <div class="activity-content">
              <p class="activity-text">{{ activity.text }}</p>
              <p class="activity-time">{{ formatTimeAgo(activity.createdAt) }}</p>
            </div>
          </div>
        </div>

        <BaseEmptyState
          v-else
          title="최근 활동이 없습니다"
          description="시스템 활동 내역이 여기에 표시됩니다"
        />
      </section>

      <!-- 인기 검색어 -->
      <section class="dashboard__section">
        <div class="section-header">
          <h2>인기 검색어</h2>
        </div>

        <div v-if="popularKeywords.length > 0" class="keyword-list">
          <div v-for="(keyword, index) in popularKeywords" :key="keyword.id" class="keyword-item">
            <span class="keyword-rank" :class="{ top3: index < 3 }">{{ index + 1 }}</span>
            <span class="keyword-text">{{ keyword.text }}</span>
            <span class="keyword-count">{{ keyword.count }}</span>
          </div>
        </div>

        <BaseEmptyState
          v-else
          title="검색 데이터가 없습니다"
          description="사용자 검색 통계가 여기에 표시됩니다"
        />
      </section>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Users as UsersIcon,
  Briefcase as BriefcaseIcon,
  ShieldCheck as ShieldCheckIcon,
  AlertCircle as AlertCircleIcon,
  UserPlus as UserPlusIcon,
  FileText as FileTextIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
} from 'lucide-vue-next'
import { AdminLayout } from '@/components/layout'
import { BaseCard, BaseButton, BaseEmptyState } from '@/components/common'
import { formatTimeAgo } from '@/utils/helpers'
import { apiClient } from '@/api'

const router = useRouter()

const stats = ref({
  totalMembers: 0,
  memberChange: 0,
  activeJobs: 0,
  jobChange: 0,
  pendingVerifications: 0,
  pendingInquiries: 0,
})

const recentActivities = ref([])
const popularKeywords = ref([])
const lastUpdated = ref('')

const getActivityIcon = (type) => {
  const icons = {
    signup: UserPlusIcon,
    job: FileTextIcon,
    verification: ShieldCheckIcon,
    accept: CheckCircleIcon,
    reject: XCircleIcon,
  }
  return icons[type] || FileTextIcon
}

onMounted(async () => {
  try {
    // 통계 데이터 로드
    const [statsRes, activitiesRes, keywordsRes] = await Promise.all([
      apiClient.get('/admin/stats'),
      apiClient.get('/admin/activities/recent'),
      apiClient.get('/admin/keywords/popular'),
    ])

    stats.value = statsRes.data
    recentActivities.value = activitiesRes.data
    popularKeywords.value = keywordsRes.data
    lastUpdated.value = new Date().toLocaleString('ko-KR')
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.dashboard {
  &__header {
    padding: $spacing-xl $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;

    h1 {
      font-size: $font-size-h2;
      font-weight: $font-weight-bold;
      margin: 0 0 $spacing-xs 0;
    }

    .last-updated {
      font-size: $font-size-caption;
      color: $color-text-secondary;
      margin: 0;
    }
  }

  &__stats {
    padding: $spacing-lg;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: $spacing-md;
  }

  &__section {
    background-color: $color-white;
    padding: $spacing-xl;
    margin-top: $spacing-md;

    .section-header {
      @include flex-between;
      margin-bottom: $spacing-lg;

      h2 {
        font-size: $font-size-h3;
        font-weight: $font-weight-semibold;
        margin: 0;
      }
    }
  }
}

.stat-card {
  &__content {
    display: flex;
    gap: $spacing-md;
    align-items: flex-start;
  }

  .stat-icon {
    @include flex-center;
    width: 56px;
    height: 56px;
    border-radius: $radius-lg;
    flex-shrink: 0;
  }

  .stat-info {
    flex: 1;

    .stat-label {
      font-size: $font-size-body-small;
      color: $color-text-secondary;
      margin: 0 0 $spacing-xs 0;
    }

    .stat-value {
      font-size: $font-size-h1;
      font-weight: $font-weight-bold;
      margin: 0 0 $spacing-xs 0;
    }

    .stat-change {
      font-size: $font-size-caption;
      color: $color-text-secondary;
      margin: 0;

      &.positive span:first-child {
        color: $color-success;
        font-weight: $font-weight-semibold;
      }

      .period {
        margin-left: $spacing-xs;
      }
    }

    .stat-urgent {
      font-size: $font-size-caption;
      color: $color-error;
      font-weight: $font-weight-semibold;
      margin: 0;
    }
  }
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.activity-item {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md;
  background-color: $color-background;
  border-radius: $radius-md;

  .activity-icon {
    @include flex-center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;

    &.type-signup {
      background-color: rgba($color-primary, 0.1);
      color: $color-primary;
    }

    &.type-job {
      background-color: rgba($color-success, 0.1);
      color: $color-success;
    }

    &.type-verification {
      background-color: rgba($color-warning, 0.1);
      color: $color-warning;
    }

    &.type-accept {
      background-color: rgba($color-success, 0.1);
      color: $color-success;
    }

    &.type-reject {
      background-color: rgba($color-error, 0.1);
      color: $color-error;
    }
  }

  .activity-content {
    flex: 1;

    .activity-text {
      font-size: $font-size-body;
      color: $color-text-primary;
      margin: 0 0 $spacing-xs 0;
    }

    .activity-time {
      font-size: $font-size-caption;
      color: $color-text-secondary;
      margin: 0;
    }
  }
}

.keyword-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.keyword-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background-color: $color-background;
  border-radius: $radius-md;

  .keyword-rank {
    @include flex-center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: $color-white;
    font-weight: $font-weight-semibold;
    color: $color-text-secondary;
    font-size: $font-size-body-small;
    flex-shrink: 0;

    &.top3 {
      background-color: $color-accent;
      color: $color-white;
    }
  }

  .keyword-text {
    flex: 1;
    font-size: $font-size-body;
    color: $color-text-primary;
  }

  .keyword-count {
    font-size: $font-size-body-small;
    color: $color-text-secondary;
  }
}
</style>

