<template>
  <div class="layout-demo">
    <div class="layout-demo__selector">
      <BaseButton
        v-for="layout in layouts"
        :key="layout.value"
        :variant="currentLayout === layout.value ? 'primary' : 'secondary'"
        @click="currentLayout = layout.value"
      >
        {{ layout.label }}
      </BaseButton>
    </div>

    <!-- 강사 레이아웃 -->
    <InstructorLayout v-if="currentLayout === 'instructor'">
      <div class="layout-demo__content">
        <h1>강사 레이아웃</h1>
        <p>상단: 로고, 검색, 알림</p>
        <p>하단: 홈, 지원 현황, 찜한 공고, 마이페이지</p>

        <div class="layout-demo__cards">
          <BaseCard v-for="n in 5" :key="n">
            <h3>공고 카드 {{ n }}</h3>
            <p>무용 강사 모집</p>
            <BaseBadge variant="success">인증 완료</BaseBadge>
          </BaseCard>
        </div>
      </div>
    </InstructorLayout>

    <!-- 학원 레이아웃 -->
    <AcademyLayout v-if="currentLayout === 'academy'">
      <div class="layout-demo__content">
        <h1>학원 레이아웃</h1>
        <p>상단: 로고, 새 공고 등록 (+), 알림</p>
        <p>하단: 공고 관리, 지원자 관리, 리뷰 관리, 학원 관리</p>

        <div class="layout-demo__cards">
          <BaseCard v-for="n in 5" :key="n">
            <h3>내 공고 {{ n }}</h3>
            <p>지원자: {{ n * 3 }}명</p>
            <BaseBadge variant="warning">게시중</BaseBadge>
          </BaseCard>
        </div>
      </div>
    </AcademyLayout>

    <!-- 관리자 레이아웃 -->
    <AdminLayout v-if="currentLayout === 'admin'">
      <template #header-actions>
        <BaseButton variant="secondary">내보내기</BaseButton>
        <BaseButton>새로고침</BaseButton>
      </template>

      <div class="layout-demo__content">
        <h2>관리자 레이아웃</h2>
        <p>좌측: 사이드 네비게이션 (대시보드, 회원 관리, 인증 관리, 공고 관리, 리뷰 관리, 문의/신고 관리)</p>
        <p>우측: 메인 컨텐츠 영역</p>

        <div class="layout-demo__stats">
          <BaseCard v-for="stat in stats" :key="stat.label">
            <h3>{{ stat.label }}</h3>
            <p class="stat-value">{{ stat.value }}</p>
            <BaseBadge :variant="stat.trend === 'up' ? 'success' : 'error'">
              {{ stat.change }}
            </BaseBadge>
          </BaseCard>
        </div>

        <div class="layout-demo__table">
          <h3>최근 활동</h3>
          <table>
            <thead>
              <tr>
                <th>사용자</th>
                <th>활동</th>
                <th>시간</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="n in 5" :key="n">
                <td>사용자{{ n }}</td>
                <td>{{ activities[n % activities.length] }}</td>
                <td>{{ n }}시간 전</td>
                <td>
                  <BaseBadge :variant="n % 2 === 0 ? 'success' : 'warning'">
                    {{ n % 2 === 0 ? '완료' : '대기' }}
                  </BaseBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { InstructorLayout, AcademyLayout, AdminLayout } from '@/components/layout'
import { BaseButton, BaseCard, BaseBadge } from '@/components/common'

const currentLayout = ref('instructor')

const layouts = [
  { value: 'instructor', label: '강사 레이아웃' },
  { value: 'academy', label: '학원 레이아웃' },
  { value: 'admin', label: '관리자 레이아웃' },
]

const stats = [
  { label: '총 회원 수', value: '1,234', change: '+12%', trend: 'up' },
  { label: '인증 대기', value: '45', change: '+5', trend: 'up' },
  { label: '게시중 공고', value: '89', change: '-3', trend: 'down' },
  { label: '신규 가입', value: '23', change: '+8', trend: 'up' },
]

const activities = ['회원가입', '공고 등록', '지원 완료', '인증 신청', '리뷰 작성']
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.layout-demo {
  &__selector {
    position: fixed;
    top: 50%;
    right: $spacing-lg;
    transform: translateY(-50%);
    z-index: $z-index-tooltip;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    background-color: $color-white;
    padding: $spacing-md;
    border-radius: $radius-lg;
    box-shadow: $shadow-modal;

    @include mobile {
      top: auto;
      bottom: calc($nav-height + $spacing-lg);
      right: $spacing-md;
      transform: none;
    }
  }

  &__content {
    padding: $spacing-lg;

    h1,
    h2 {
      margin-bottom: $spacing-lg;
    }

    p {
      color: $color-text-secondary;
      margin-bottom: $spacing-md;
    }
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: $spacing-lg;
    margin-top: $spacing-xl;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-lg;
    margin-bottom: $spacing-2xl;

    .stat-value {
      font-size: $font-size-h1;
      font-weight: $font-weight-bold;
      color: $color-primary;
      margin: $spacing-md 0;
    }
  }

  &__table {
    background-color: $color-white;
    border-radius: $radius-lg;
    padding: $spacing-xl;
    box-shadow: $shadow-card;

    h3 {
      margin-bottom: $spacing-lg;
    }

    table {
      width: 100%;
      border-collapse: collapse;

      th,
      td {
        text-align: left;
        padding: $spacing-md;
        border-bottom: 1px solid $color-divider;
      }

      th {
        font-weight: $font-weight-semibold;
        color: $color-text-secondary;
        font-size: $font-size-body-small;
      }

      td {
        color: $color-text-primary;
      }

      tbody tr:hover {
        background-color: $color-background;
      }
    }
  }
}
</style>

