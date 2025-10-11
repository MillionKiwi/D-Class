# Pinia Stores

## 📦 Store 구조

### 1. authStore (인증)
**경로:** `src/stores/authStore.js`

#### State
- `user` - 현재 사용자 정보
- `accessToken` - 액세스 토큰
- `refreshToken` - 리프레시 토큰
- `isLoading` - 로딩 상태

#### Getters
- `isAuthenticated` - 로그인 여부
- `userRole` - 사용자 역할 (instructor/academy/admin)
- `isInstructor` - 강사 여부
- `isAcademy` - 학원 여부
- `isAdmin` - 관리자 여부
- `userName` - 사용자 이름
- `userEmail` - 사용자 이메일

#### Actions
- `login(credentials)` - 로그인
- `signup(signupData)` - 회원가입
- `logout()` - 로그아웃
- `refreshAccessToken()` - 토큰 갱신
- `fetchCurrentUser()` - 현재 사용자 정보 조회
- `restoreAuth()` - 로컬 스토리지에서 인증 정보 복원

### 2. jobStore (공고)
**경로:** `src/stores/jobStore.js`

#### State
- `jobs` - 공고 목록
- `currentJob` - 현재 선택된 공고
- `favoriteJobs` - 찜한 공고 목록
- `filters` - 필터 설정 (지역, 장르, 근무시간, 정렬)
- `pagination` - 페이지네이션 정보
- `isLoading` - 로딩 상태

#### Getters
- `filteredJobs` - 필터링된 공고 목록
- `favoriteJobIds` - 찜한 공고 ID 목록
- `isFavorite(jobId)` - 특정 공고 찜 여부

#### Actions
- `fetchJobs(params)` - 공고 목록 조회
- `fetchJobDetail(jobId)` - 공고 상세 조회
- `createJob(jobData)` - 공고 등록 (학원)
- `updateJob(jobId, jobData)` - 공고 수정 (학원)
- `deleteJob(jobId)` - 공고 삭제 (학원)
- `closeJob(jobId)` - 공고 마감 (학원)
- `addFavorite(jobId)` - 찜하기
- `removeFavorite(jobId)` - 찜 해제
- `fetchFavoriteJobs()` - 찜한 공고 목록 조회
- `setFilter(key, value)` - 필터 설정
- `resetFilters()` - 필터 초기화
- `loadMore()` - 다음 페이지 로드

### 3. applicationStore (지원/지원자)
**경로:** `src/stores/applicationStore.js`

#### State
- `applications` - 내 지원 목록 (강사)
- `currentApplication` - 현재 선택된 지원
- `applicants` - 지원자 목록 (학원)
- `isLoading` - 로딩 상태

#### Getters
- `applicationsByStatus(status)` - 상태별 지원 목록
- `applicationCount` - 총 지원 개수
- `applicantsByStatus(status)` - 상태별 지원자 목록
- `newApplicantsCount` - 새 지원자 수

#### Actions
**강사용:**
- `applyToJob(jobId)` - 공고 지원하기
- `fetchMyApplications()` - 내 지원 현황 조회
- `fetchApplicationDetail(applicationId)` - 지원 상세 조회

**학원용:**
- `fetchApplicants(jobId)` - 지원자 목록 조회
- `fetchApplicantDetail(applicantId)` - 지원자 상세 조회
- `acceptApplicant(applicantId)` - 채용 확정
- `rejectApplicant(applicantId)` - 불합격 처리
- `fetchHiredList()` - 채용 확정 목록 조회

### 4. notificationStore (알림)
**경로:** `src/stores/notificationStore.js`

#### State
- `notifications` - 알림 목록
- `unreadCount` - 읽지 않은 알림 개수
- `settings` - 알림 설정
- `isLoading` - 로딩 상태

#### Getters
- `unreadNotifications` - 읽지 않은 알림
- `readNotifications` - 읽은 알림

#### Actions
- `fetchNotifications()` - 알림 목록 조회
- `markAsRead(notificationId)` - 알림 읽음 처리
- `markAllAsRead()` - 모든 알림 읽음 처리
- `deleteNotification(notificationId)` - 알림 삭제
- `fetchNotificationSettings()` - 알림 설정 조회
- `updateNotificationSettings(settings)` - 알림 설정 저장
- `addNotification(notification)` - 새 알림 추가 (실시간)

### 5. profileStore (프로필)
**경로:** `src/stores/profileStore.js`

#### State
- `profile` - 프로필 정보
- `verificationStatus` - 인증 상태
- `isLoading` - 로딩 상태

#### Actions
- `fetchProfile()` - 프로필 조회
- `updateProfile(profileData)` - 프로필 업데이트
- `uploadProfileImage(file)` - 프로필 사진 업로드
- `submitVerification(files)` - 인증 서류 제출
- `fetchVerificationStatus()` - 인증 상태 조회
- `addCareer(careerData)` - 경력 추가 (강사)
- `deleteCareer(careerId)` - 경력 삭제 (강사)
- `addEducation(educationData)` - 학력 추가 (강사)
- `deleteEducation(educationId)` - 학력 삭제 (강사)

## 🎯 사용 예시

### 기본 사용법
```vue
<script setup>
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()

// State 접근
console.log(authStore.user)
console.log(authStore.isAuthenticated)

// Action 호출
const handleLogin = async () => {
  const result = await authStore.login({
    email: 'user@example.com',
    password: 'password123'
  })
  
  if (result.success) {
    console.log('로그인 성공')
  }
}
</script>
```

### Composition API에서 사용
```vue
<script setup>
import { computed } from 'vue'
import { useJobStore } from '@/stores'

const jobStore = useJobStore()

// Getter 사용
const jobs = computed(() => jobStore.filteredJobs)
const isLoading = computed(() => jobStore.isLoading)

// 데이터 로드
onMounted(async () => {
  await jobStore.fetchJobs()
})

// 필터 변경
const handleFilterChange = (genre) => {
  jobStore.setFilter('genres', [genre])
}
</script>
```

### 여러 Store 조합
```vue
<script setup>
import { useAuthStore, useJobStore, useApplicationStore } from '@/stores'

const authStore = useAuthStore()
const jobStore = useJobStore()
const applicationStore = useApplicationStore()

// 현재 사용자가 강사일 때만 지원 가능
const canApply = computed(() => {
  return authStore.isInstructor && !applicationStore.isLoading
})

const handleApply = async (jobId) => {
  if (!canApply.value) return
  
  const result = await applicationStore.applyToJob(jobId)
  if (result.success) {
    // 지원 성공 후 지원 현황 새로고침
    await applicationStore.fetchMyApplications()
  }
}
</script>
```

### storeToRefs 사용 (Reactivity 유지)
```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores'

const notificationStore = useNotificationStore()

// storeToRefs로 reactive 속성 유지
const { notifications, unreadCount } = storeToRefs(notificationStore)

// actions는 storeToRefs 없이 직접 사용
const { markAsRead, markAllAsRead } = notificationStore
</script>

<template>
  <div>
    <p>읽지 않은 알림: {{ unreadCount }}</p>
    <ul>
      <li v-for="notification in notifications" :key="notification.id">
        {{ notification.message }}
        <button @click="markAsRead(notification.id)">읽음</button>
      </li>
    </ul>
  </div>
</template>
```

## 🔄 Store 간 통신

### authStore에서 다른 Store 접근
```javascript
// authStore.js
import { useJobStore } from './jobStore'

export const useAuthStore = defineStore('auth', () => {
  const logout = async () => {
    // 로그아웃 시 다른 store 초기화
    const jobStore = useJobStore()
    jobStore.$reset()
    
    // ... 로그아웃 로직
  }
})
```

## 💾 데이터 지속성

### localStorage 활용
- **authStore**: 토큰과 사용자 정보를 localStorage에 자동 저장
- 앱 초기화 시 `restoreAuth()`로 인증 정보 복원
- 로그아웃 시 localStorage 자동 클리어

### 예시
```javascript
// 앱 초기화 (main.js)
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()
authStore.restoreAuth() // localStorage에서 복원
```

## 🚨 에러 처리

모든 store actions는 `{ success, error }` 형태로 결과 반환:

```javascript
const result = await jobStore.createJob(jobData)

if (result.success) {
  // 성공 처리
  console.log('공고 등록 성공')
} else {
  // 실패 처리
  console.error('공고 등록 실패:', result.error)
}
```

Toast 알림은 store 내부에서 자동 표시됩니다.

## 📝 주의사항

1. **Reactivity**: `storeToRefs()`를 사용하여 reactive 속성 유지
2. **Actions**: 항상 async/await 사용
3. **에러 처리**: try-catch로 모든 API 호출 감싸기
4. **로딩 상태**: API 호출 전후로 `isLoading` 관리
5. **토큰 갱신**: authStore의 `refreshAccessToken()` 활용
6. **Store Reset**: 필요시 `store.$reset()` 사용

