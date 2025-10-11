<template>
  <BaseCard clickable class="job-card" @click="handleClick">
    <!-- 상단: 지원 완료 배지 -->
    <div v-if="job.hasApplied" class="job-card__applied-badge">
      <BaseBadge variant="info">지원 완료</BaseBadge>
    </div>

    <!-- 학원 정보 -->
    <div class="job-card__academy">
      <h3 class="job-card__academy-name">
        {{ job.academyName }}
        <BaseBadge v-if="job.isVerified" variant="success" size="small">✓</BaseBadge>
      </h3>
    </div>

    <!-- 공고 제목 -->
    <h4 class="job-card__title">{{ job.title }}</h4>

    <!-- 정보 태그 -->
    <div class="job-card__tags">
      <span class="tag">
        <MapPinIcon :size="14" />
        {{ job.region }}
      </span>
      <span class="tag">
        <MusicIcon :size="14" />
        {{ job.genres.join(', ') }}
      </span>
    </div>

    <!-- 급여 -->
    <div class="job-card__salary">{{ formatSalary(job.salary, job.salaryType) }}</div>

    <!-- 하단 정보 -->
    <div class="job-card__footer">
      <span class="job-card__date">{{ formatRelativeTime(job.createdAt) }}</span>
      <button
        class="job-card__favorite"
        :class="{ active: isFavorite }"
        @click.stop="handleFavorite"
      >
        <HeartIcon :size="20" :fill="isFavorite ? 'currentColor' : 'none'" />
      </button>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { MapPin as MapPinIcon, Music as MusicIcon, Heart as HeartIcon } from 'lucide-vue-next'
import { BaseCard, BaseBadge } from '@/components/common'
import { useJobStore } from '@/stores'
import { formatSalary, formatRelativeTime } from '@/utils/helpers'

const props = defineProps({
  job: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['favorite-toggle'])
const router = useRouter()
const jobStore = useJobStore()

const isFavorite = computed(() => jobStore.isFavorite(props.job.id))

const handleClick = () => {
  router.push(`/instructor/jobs/${props.job.id}`)
}

const handleFavorite = async () => {
  if (isFavorite.value) {
    await jobStore.removeFavorite(props.job.id)
  } else {
    await jobStore.addFavorite(props.job.id)
  }
  emit('favorite-toggle', props.job.id, !isFavorite.value)
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.job-card {
  position: relative;
  padding: $spacing-lg !important;

  &__applied-badge {
    position: absolute;
    top: $spacing-md;
    left: $spacing-md;
  }

  &__academy {
    margin-bottom: $spacing-sm;
  }

  &__academy-name {
    font-size: $font-size-body;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
    margin: 0;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  &__title {
    font-size: $font-size-h3;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
    margin: 0 0 $spacing-md 0;
    @include text-ellipsis(2);
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;

    .tag {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      font-size: $font-size-body-small;
      color: $color-text-secondary;
    }
  }

  &__salary {
    font-size: $font-size-h3;
    font-weight: $font-weight-bold;
    color: $color-primary;
    margin-bottom: $spacing-md;
  }

  &__footer {
    @include flex-between;
    padding-top: $spacing-md;
    border-top: 1px solid $color-divider;
  }

  &__date {
    font-size: $font-size-caption;
    color: $color-text-secondary;
  }

  &__favorite {
    @include touch-target;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: $color-text-secondary;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      color: $color-accent;
      transform: scale(1.1);
    }

    &.active {
      color: $color-accent;
    }
  }
}
</style>

