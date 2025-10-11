<template>
  <div class="customer-support">
    <!-- 헤더 -->
    <div class="customer-support__header">
      <button class="back-button" @click="$router.back()">
        <ArrowLeftIcon :size="24" />
      </button>
      <h1>고객센터</h1>
      <div style="width: 44px"></div>
    </div>

    <!-- 컨텐츠 -->
    <div class="customer-support__content">
      <!-- FAQ 섹션 -->
      <section class="customer-support__section">
        <h3 class="section-title">자주 묻는 질문 (FAQ)</h3>

        <div class="faq-list">
          <div v-for="(faq, index) in faqs" :key="index" class="faq-item">
            <button
              :class="['faq-question', { active: activeFaq === index }]"
              @click="toggleFaq(index)"
            >
              <span>{{ faq.question }}</span>
              <ChevronDownIcon
                :size="20"
                :class="['faq-icon', { rotated: activeFaq === index }]"
              />
            </button>
            <div v-show="activeFaq === index" class="faq-answer">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </section>

      <!-- 1:1 문의 -->
      <section class="customer-support__section">
        <h3 class="section-title">1:1 문의하기</h3>
        <p class="section-description">
          FAQ에서 답을 찾지 못하셨나요? 문의 사항을 남겨주시면 빠르게 답변드리겠습니다.
        </p>
        <BaseButton block @click="$router.push('/support/inquiry')">
          <MessageSquareIcon :size="20" />
          문의하기
        </BaseButton>
      </section>

      <!-- 운영 시간 안내 -->
      <section class="customer-support__section">
        <h3 class="section-title">운영 시간 안내</h3>
        <div class="operating-hours">
          <div class="hours-item">
            <ClockIcon :size="20" />
            <div>
              <p class="hours-label">평일</p>
              <p class="hours-value">09:00 - 18:00</p>
            </div>
          </div>
          <div class="hours-item">
            <CalendarIcon :size="20" />
            <div>
              <p class="hours-label">주말 및 공휴일</p>
              <p class="hours-value">휴무</p>
            </div>
          </div>
          <div class="hours-item">
            <MailIcon :size="20" />
            <div>
              <p class="hours-label">이메일</p>
              <p class="hours-value">support@d-class.com</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  ArrowLeft as ArrowLeftIcon,
  ChevronDown as ChevronDownIcon,
  MessageSquare as MessageSquareIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Mail as MailIcon,
} from 'lucide-vue-next'
import { BaseButton } from '@/components/common'

const activeFaq = ref(null)

const faqs = [
  {
    question: '회원가입은 어떻게 하나요?',
    answer:
      '홈페이지 상단의 "회원가입" 버튼을 클릭하여 강사 또는 학원 유형을 선택한 후, 필요한 정보를 입력하시면 됩니다. 이메일 인증 후 바로 이용하실 수 있습니다.',
  },
  {
    question: '인증은 필수인가요?',
    answer:
      '인증은 선택 사항이지만, 인증을 완료하면 프로필에 인증 배지가 표시되어 신뢰도가 높아집니다. 강사는 학력/경력 증명서, 학원은 사업자등록증을 제출하시면 됩니다.',
  },
  {
    question: '지원은 어떻게 하나요?',
    answer:
      '마음에 드는 공고를 찾으신 후, 공고 상세 페이지에서 "지원하기" 버튼을 클릭하시면 됩니다. 지원 후에는 지원 현황 페이지에서 상태를 확인하실 수 있습니다.',
  },
  {
    question: '공고 등록은 어떻게 하나요?',
    answer:
      '학원 회원으로 로그인 후, 상단의 "+" 버튼을 클릭하여 공고를 작성하시면 됩니다. 관리자 검토 후 승인되면 게시됩니다.',
  },
  {
    question: '결제는 어떻게 이루어지나요?',
    answer:
      'D-Class는 무료 서비스입니다. 강사 구인/구직을 위한 플랫폼 이용에 별도의 비용이 발생하지 않습니다.',
  },
  {
    question: '리뷰는 언제 작성할 수 있나요?',
    answer:
      '채용이 확정된 후에만 서로에 대한 리뷰를 작성할 수 있습니다. 솔직하고 객관적인 리뷰 작성을 부탁드립니다.',
  },
  {
    question: '회원 탈퇴는 어떻게 하나요?',
    answer:
      '마이페이지 > 설정 > 계정 설정 > 회원 탈퇴에서 진행하실 수 있습니다. 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없으니 신중하게 결정해주세요.',
  },
]

const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.customer-support {
  min-height: 100vh;
  background-color: $color-background;

  &__header {
    @include flex-between;
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-divider;

    .back-button {
      @include touch-target;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: $color-text-primary;
      cursor: pointer;
    }

    h1 {
      flex: 1;
      text-align: center;
      font-size: $font-size-h3;
      margin: 0;
    }
  }

  &__content {
    padding: $spacing-lg;
  }

  &__section {
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;
    padding: $spacing-xl;
    margin-bottom: $spacing-lg;
  }
}

.section-title {
  font-size: $font-size-h3;
  font-weight: $font-weight-semibold;
  margin: 0 0 $spacing-lg 0;
  color: $color-text-primary;
}

.section-description {
  font-size: $font-size-body-small;
  color: $color-text-secondary;
  margin: 0 0 $spacing-lg 0;
  line-height: $line-height-relaxed;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.faq-item {
  border: 1px solid $color-divider;
  border-radius: $radius-md;
  overflow: hidden;
}

.faq-question {
  width: 100%;
  @include flex-between;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background-color: $color-background;
  }

  &.active {
    background-color: rgba($color-primary, 0.05);
  }

  span {
    flex: 1;
    font-size: $font-size-body;
    font-weight: $font-weight-medium;
    color: $color-text-primary;
  }

  .faq-icon {
    color: $color-text-secondary;
    transition: transform $transition-fast;
    flex-shrink: 0;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.faq-answer {
  padding: $spacing-lg;
  padding-top: 0;
  font-size: $font-size-body-small;
  color: $color-text-primary;
  line-height: $line-height-relaxed;
  background-color: rgba($color-primary, 0.02);
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.operating-hours {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.hours-item {
  display: flex;
  gap: $spacing-md;
  align-items: flex-start;

  svg {
    color: $color-primary;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .hours-label {
    font-size: $font-size-body-small;
    color: $color-text-secondary;
    margin: 0 0 $spacing-xs 0;
  }

  .hours-value {
    font-size: $font-size-body;
    font-weight: $font-weight-medium;
    color: $color-text-primary;
    margin: 0;
  }
}
</style>

