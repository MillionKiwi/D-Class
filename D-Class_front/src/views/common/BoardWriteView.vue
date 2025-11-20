<template>
  <AppLayout>
    <div class="board-write-page page-container">
      <div class="page-header">
        <button class="back-btn" @click="handleBack">←</button>
        <h1 class="page-title">{{ isEditMode ? '글 수정' : '글 작성' }}</h1>
        <Button @click="handleSubmit" :loading="saving" :disabled="!isValid">
          {{ isEditMode ? '수정' : '작성' }}
        </Button>
      </div>

      <form @submit.prevent="handleSubmit" class="write-form">
        <div class="input-wrapper">
          <label class="input-label">제목 <span class="required-star">*</span></label>
          <input
            v-model="form.title"
            type="text"
            class="input-field"
            placeholder="제목을 입력하세요"
            maxlength="100"
          />
          <span class="char-count">{{ form.title.length }}/100</span>
        </div>

        <div class="input-wrapper">
          <label class="input-label">내용 <span class="required-star">*</span></label>
          <textarea
            v-model="form.content"
            class="textarea-field"
            placeholder="내용을 입력하세요"
            rows="10"
          ></textarea>
          <span class="char-count">{{ form.content.length }}/5000</span>
        </div>

        <div class="input-wrapper">
          <label class="input-label">이미지</label>
          <div class="image-upload-section">
            <div v-if="form.imagePreviews.length > 0" class="image-preview-list">
              <div v-for="(image, index) in form.imagePreviews" :key="index" class="image-preview-item">
                <img :src="image" alt="이미지 미리보기" />
                <button type="button" class="remove-image-btn" @click="removeImage(index)">
                  ✕
                </button>
              </div>
            </div>
            <button
              v-if="form.imagePreviews.length < 5"
              type="button"
              class="image-upload-btn"
              @click="handleImageUpload"
            >
              <span>📷</span>
              <span>이미지 추가 (최대 5개)</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBoardStore } from '@/stores/board'
import { inject } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Button from '@/components/common/Button.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const boardStore = useBoardStore()
const showToast = inject('toast', () => {})

const isEditMode = computed(() => !!route.params.id)
const saving = ref(false)
const hasChanges = ref(false)

const form = reactive({
  title: '',
  content: '',
  images: [], // File 객체 배열
  imagePreviews: [], // 미리보기용 base64 배열
  deleteImageIds: [], // 삭제할 이미지 ID 배열
})

const isValid = computed(() => {
  return form.title.trim().length > 0 && form.content.trim().length >= 10
})

const fetchPost = async () => {
  if (!isEditMode.value) return

  const result = await boardStore.fetchPostDetail(parseInt(route.params.id))
  if (result.success && result.data) {
    const post = result.data
    form.title = post.title
    form.content = post.content
    // 이미지는 이미지 URL로 표시 (수정 시 새로 업로드할 수 있음)
    if (post.images && post.images.length > 0) {
      form.imagePreviews = post.images.map(img => {
        // PostImageSerializer는 {id, image, order} 형태로 반환
        // image 필드는 이미지 URL 문자열
        if (typeof img === 'string') {
          return img
        }
        // 객체인 경우 image 필드에서 URL 가져오기
        return img.image || ''
      }).filter(url => url)
    } else {
      form.imagePreviews = []
    }
  } else {
    if (showToast && typeof showToast === 'function') {
      showToast('게시글을 불러오는데 실패했습니다', 'error')
    }
  }
}

const handleImageUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = (e) => {
    const files = Array.from(e.target.files)
    const remainingSlots = 5 - form.images.length
    const filesToAdd = files.slice(0, remainingSlots)

    filesToAdd.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        if (showToast && typeof showToast === 'function') {
          showToast('이미지 크기는 10MB 이하만 가능합니다', 'error')
        }
        return
      }

      // File 객체 저장
      form.images.push(file)
      
      // 미리보기용 base64 생성
      const reader = new FileReader()
      reader.onload = (event) => {
        form.imagePreviews.push(event.target.result)
        hasChanges.value = true
      }
      reader.readAsDataURL(file)
    })

    if (files.length > remainingSlots) {
      if (showToast && typeof showToast === 'function') {
        showToast(`최대 5개까지만 추가할 수 있습니다. ${remainingSlots}개만 추가되었습니다.`, 'warning')
      }
    }
  }
  input.click()
}

const removeImage = (index) => {
  // 수정 모드에서 기존 이미지를 삭제하는 경우
  if (isEditMode.value && form.imagePreviews[index] && typeof form.imagePreviews[index] === 'string' && form.imagePreviews[index].startsWith('http')) {
    // 기존 이미지 URL인 경우, 해당 이미지의 ID를 찾아서 삭제 목록에 추가
    // 현재는 이미지 ID를 추적하기 어려우므로, 프론트엔드에서만 제거
    // 백엔드에서 이미지 삭제는 delete_image_ids로 처리
  }
  
  form.images.splice(index, 1)
  form.imagePreviews.splice(index, 1)
  hasChanges.value = true
}

const handleSubmit = async () => {
  if (!isValid.value) {
    if (showToast && typeof showToast === 'function') {
      showToast('제목과 내용(10자 이상)을 입력해주세요', 'error')
    }
    return
  }

  saving.value = true
  try {
    const formData = new FormData()
    formData.append('title', form.title.trim())
    formData.append('content', form.content.trim())
    
    // 이미지 파일 추가
    form.images.forEach((file) => {
      if (file instanceof File) {
        formData.append('images', file)
      }
    })
    
    // 수정 모드인 경우 삭제할 이미지 ID 추가
    if (isEditMode.value && form.deleteImageIds.length > 0) {
      form.deleteImageIds.forEach((id) => {
        formData.append('delete_image_ids', id)
      })
    }

    let result
    if (isEditMode.value) {
      result = await boardStore.updatePost(parseInt(route.params.id), formData)
    } else {
      result = await boardStore.createPost(formData)
    }

    if (result.success) {
      hasChanges.value = false
      if (showToast && typeof showToast === 'function') {
        showToast(isEditMode.value ? '게시글이 수정되었습니다' : '게시글이 작성되었습니다', 'success')
      }
      router.push(`/board/${result.data.id}`)
    } else {
      if (showToast && typeof showToast === 'function') {
        showToast(result.error || '저장 중 오류가 발생했습니다', 'error')
      }
    }
  } catch (error) {
    console.error('Failed to save post:', error)
    if (showToast && typeof showToast === 'function') {
      showToast('저장 중 오류가 발생했습니다', 'error')
    }
  } finally {
    saving.value = false
  }
}

const handleBack = () => {
  if (hasChanges.value) {
    if (confirm('저장하지 않은 변경사항이 있습니다. 나가시겠습니까?')) {
      router.push('/board')
    }
  } else {
    router.push('/board')
  }
}

onMounted(() => {
  if (!authStore.user) {
    authStore.fetchCurrentUser()
  }
  fetchPost()
})
</script>

<style scoped>
.board-write-page {
  padding: var(--spacing-lg);
  padding-bottom: calc(var(--spacing-lg) + 64px);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-primary);
  padding: var(--spacing-sm);
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  flex: 1;
  text-align: center;
}

.write-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.input-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.required-star {
  color: var(--color-error);
}

.input-field {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-divider);
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  background-color: var(--color-card);
  color: var(--color-text-primary);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
}

.textarea-field {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-divider);
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  background-color: var(--color-card);
  color: var(--color-text-primary);
  resize: vertical;
  min-height: 200px;
  line-height: 1.6;
}

.textarea-field:focus {
  outline: none;
  border-color: var(--color-primary);
}

.char-count {
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: right;
}

.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.image-preview-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.image-preview-item {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--color-divider);
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background-color 0.2s;
}

.remove-image-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.image-upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  border: 2px dashed var(--color-divider);
  border-radius: 8px;
  background-color: var(--color-card);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.image-upload-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: rgba(167, 199, 231, 0.05);
}

.image-upload-btn span:first-child {
  font-size: 32px;
}
</style>

