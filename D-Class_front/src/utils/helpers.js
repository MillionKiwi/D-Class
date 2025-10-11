/**
 * 유틸리티 헬퍼 함수들
 */
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'

dayjs.extend(relativeTime)
dayjs.locale('ko')

// 날짜 포맷팅
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  return dayjs(date).format(format)
}

// 상대 시간 표시 (예: 3시간 전)
export const formatRelativeTime = (date) => {
  return dayjs(date).fromNow()
}

// 숫자 포맷팅 (1000 -> 1,000)
export const formatNumber = (number) => {
  return new Intl.NumberFormat('ko-KR').format(number)
}

// 급여 포맷팅
export const formatSalary = (amount, type = 'hourly') => {
  const formatted = formatNumber(amount)
  return type === 'hourly' ? `시급 ${formatted}원` : `월급 ${formatted}원`
}

// 파일 크기 포맷팅 (bytes -> KB, MB)
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 디바운스
export const debounce = (func, wait = 500) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 쓰로틀
export const throttle = (func, limit = 500) => {
  let inThrottle
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 배열 청크 분할
export const chunkArray = (array, size) => {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// 이미지 URL 생성 (파일 객체 -> URL)
export const createImageUrl = (file) => {
  return URL.createObjectURL(file)
}

// 이미지 URL 해제
export const revokeImageUrl = (url) => {
  URL.revokeObjectURL(url)
}

// 로컬 스토리지 안전하게 사용
export const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error)
      return null
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error)
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error)
    }
  },
  clear() {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage', error)
    }
  },
}

// 쿼리 파라미터 생성
export const buildQueryString = (params) => {
  const query = new URLSearchParams()
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      query.append(key, params[key])
    }
  })
  return query.toString()
}

// 스크롤 최상단으로 이동
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto',
  })
}

// 요소까지 스크롤
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId)
  if (element) {
    const top = element.offsetTop - offset
    window.scrollTo({
      top,
      behavior: 'smooth',
    })
  }
}

// 복사하기
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('복사 실패:', error)
    return false
  }
}

// 랜덤 ID 생성
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

