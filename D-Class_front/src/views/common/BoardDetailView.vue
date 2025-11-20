<template>
  <AppLayout>
    <div v-if="loading && !post" class="loading-container">
      <LoadingSpinner />
    </div>

    <div v-else-if="post" class="board-detail-page page-container">
      <div class="post-header card">
        <div class="post-author">
          <div class="author-avatar">
            <img
              v-if="post.author.profile_image"
              :src="post.author.profile_image"
              alt="프로필"
            />
            <div v-else class="avatar-placeholder">👤</div>
          </div>
          <div class="author-info">
            <span class="author-name">
              {{ post.author.name }}
              <Badge v-if="post.author.is_verified" variant="success" small>✓</Badge>
            </span>
            <span class="post-date">{{ formatDate(post.created_at) }}</span>
          </div>
        </div>
        <div v-if="isAuthor" class="post-actions">
          <Button variant="secondary" small @click="editPost">수정</Button>
          <Button variant="error" small @click="deletePost">삭제</Button>
        </div>
      </div>

      <div class="post-content card">
        <h1 class="post-title">{{ post.title }}</h1>

        <div v-if="post.images && post.images.length > 0" class="post-images">
          <img
            v-for="(image, index) in post.images"
            :key="index"
            :src="image.image || image"
            alt="게시글 이미지"
            class="post-image"
          />
        </div>

        <div class="post-text">
          <p v-for="(paragraph, index) in post.content.split('\n')" :key="index">
            {{ paragraph }}
          </p>
        </div>

        <div class="post-footer">
          <span class="post-stats">
            <span class="stat-item">👁️ {{ post.views || 0 }}</span>
            <span class="stat-item">💬 {{ post.comments_count || 0 }}</span>
          </span>
        </div>
      </div>

      <!-- 댓글 섹션 (추후 구현) -->
      <div class="comments-section card">
        <h3 class="section-title">댓글 ({{ post.comments_count || 0 }})</h3>
        <div class="comments-placeholder">
          <p>댓글 기능은 추후 구현 예정입니다.</p>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>게시글을 찾을 수 없습니다</p>
      <Button @click="$router.push('/board')">목록으로</Button>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBoardStore } from '@/stores/board'
import { storeToRefs } from 'pinia'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { inject } from 'vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const boardStore = useBoardStore()
const showToast = inject('toast', () => {})

const { currentPost, loading } = storeToRefs(boardStore)

const post = computed(() => currentPost.value)

const isAuthor = computed(() => {
  return post.value && authStore.user && post.value.is_author
})

const fetchPost = async () => {
  const result = await boardStore.fetchPostDetail(parseInt(route.params.id))
  if (result.success) {
    // 조회수 증가
    await boardStore.incrementViews(parseInt(route.params.id))
  } else {
    if (showToast && typeof showToast === 'function') {
      showToast('게시글을 불러오는데 실패했습니다', 'error')
    }
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const editPost = () => {
  router.push(`/board/${post.value.id}/edit`)
}

const deletePost = async () => {
  if (confirm('정말 삭제하시겠습니까?')) {
    const result = await boardStore.deletePost(parseInt(route.params.id))
    if (result.success) {
      if (showToast && typeof showToast === 'function') {
        showToast('게시글이 삭제되었습니다', 'success')
      }
      router.push('/board')
    } else {
      if (showToast && typeof showToast === 'function') {
        showToast(result.error || '삭제 중 오류가 발생했습니다', 'error')
      }
    }
  }
}

onMounted(() => {
  fetchPost()
})
</script>

<style scoped>
.board-detail-page {
  padding: var(--spacing-lg);
  padding-bottom: calc(var(--spacing-lg) + 64px);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.post-author {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-divider);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 24px;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.post-date {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.post-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.post-content {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-xl);
}

.post-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: var(--spacing-xl);
  color: var(--color-text-primary);
  line-height: 1.4;
}

.post-images {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.post-image {
  width: 100%;
  border-radius: 8px;
  background-color: var(--color-divider);
}

.post-text {
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text-primary);
  white-space: pre-wrap;
  margin-bottom: var(--spacing-xl);
}

.post-text p {
  margin-bottom: var(--spacing-md);
}

.post-text p:last-child {
  margin-bottom: 0;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-divider);
}

.post-stats {
  display: flex;
  gap: var(--spacing-lg);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.comments-section {
  padding: var(--spacing-lg);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

.comments-placeholder {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
  color: var(--color-text-secondary);
}

.empty-state p {
  margin-bottom: var(--spacing-lg);
  font-size: 16px;
}
</style>

