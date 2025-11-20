<template>
  <AppLayout>
    <div class="board-page page-container">
      <div class="page-header">
        <h1 class="page-title">발레 작품 이야기</h1>
        <Button @click="goToWrite" small>글쓰기</Button>
      </div>

      <div v-if="loading && posts.length === 0" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else-if="posts.length > 0" class="posts-list">
        <Card
          v-for="post in posts"
          :key="post.id"
          class="post-card"
          clickable
          @click="viewPost(post.id)"
        >
          <div class="post-header">
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
                <span class="author-name">{{ post.author.name }}</span>
                <span class="post-date">{{ formatDate(post.created_at) }}</span>
              </div>
            </div>
            <Badge v-if="post.author.is_verified" variant="success" small>✓</Badge>
          </div>

          <h3 class="post-title">{{ post.title }}</h3>

          <div v-if="post.thumbnail" class="post-thumbnail">
            <img :src="typeof post.thumbnail === 'string' && post.thumbnail.startsWith('http') ? post.thumbnail : (post.thumbnail.image || post.thumbnail)" alt="썸네일" />
          </div>

          <p class="post-preview">{{ truncateText(post.content || '', 100) }}</p>

          <div class="post-footer">
            <span class="post-stats">
              <span class="stat-item">👁️ {{ post.views || 0 }}</span>
              <span class="stat-item">💬 {{ post.comments_count || 0 }}</span>
            </span>
          </div>
        </Card>
      </div>

      <div v-else class="empty-state">
        <p>아직 작성된 글이 없습니다</p>
        <Button @click="goToWrite">첫 글 작성하기</Button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardStore } from '@/stores/board'
import { storeToRefs } from 'pinia'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/common/Card.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const boardStore = useBoardStore()

const { posts, loading } = storeToRefs(boardStore)

const fetchPosts = async () => {
  await boardStore.fetchPosts({ board_name: '발레 작품 이야기' })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  return date.toLocaleDateString('ko-KR')
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const viewPost = (id) => {
  router.push(`/board/${id}`)
}

const goToWrite = () => {
  router.push('/board/write')
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.board-page {
  padding: var(--spacing-lg);
  padding-bottom: calc(var(--spacing-lg) + 64px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.post-card {
  padding: var(--spacing-lg);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.post-author {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.author-avatar {
  width: 40px;
  height: 40px;
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
  font-size: 20px;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.post-date {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.post-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
  line-height: 1.4;
}

.post-thumbnail {
  width: 100%;
  max-height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: var(--spacing-md);
  background-color: var(--color-divider);
}

.post-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-preview {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-divider);
}

.post-stats {
  display: flex;
  gap: var(--spacing-md);
  font-size: 12px;
  color: var(--color-text-secondary);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
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

