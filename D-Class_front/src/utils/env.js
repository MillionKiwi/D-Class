/**
 * 환경변수 관리 유틸리티
 * Vite 환경변수를 타입 안전하게 접근하고 관리
 */

/**
 * 환경변수 값을 가져오는 헬퍼 함수
 * @param {string} key - 환경변수 키 (VITE_ 접두사 포함)
 * @param {any} defaultValue - 기본값
 * @returns {string} 환경변수 값 또는 기본값
 */
const getEnv = (key, defaultValue = '') => {
  return import.meta.env[key] ?? defaultValue
}

/**
 * 숫자형 환경변수를 가져오는 헬퍼 함수
 * @param {string} key - 환경변수 키
 * @param {number} defaultValue - 기본값
 * @returns {number} 파싱된 숫자 값
 */
const getEnvNumber = (key, defaultValue = 0) => {
  const value = getEnv(key)
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * 불린형 환경변수를 가져오는 헬퍼 함수
 * @param {string} key - 환경변수 키
 * @param {boolean} defaultValue - 기본값
 * @returns {boolean} 불린 값
 */
const getEnvBoolean = (key, defaultValue = false) => {
  const value = getEnv(key).toLowerCase()
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  return defaultValue
}

/**
 * 배열형 환경변수를 가져오는 헬퍼 함수
 * @param {string} key - 환경변수 키
 * @param {string} separator - 구분자 (기본: 쉼표)
 * @returns {string[]} 배열
 */
const getEnvArray = (key, separator = ',') => {
  const value = getEnv(key)
  if (!value) return []
  return value.split(separator).map((item) => item.trim())
}

// ============================================
// 환경변수 설정 객체
// ============================================

export const env = {
  // 앱 정보
  app: {
    env: getEnv('VITE_APP_ENV', 'development'),
    name: getEnv('VITE_APP_NAME', 'D-Class'),
    version: getEnv('VITE_APP_VERSION', '1.0.0'),
    isDevelopment: getEnv('VITE_APP_ENV', 'development') === 'development',
    isProduction: getEnv('VITE_APP_ENV', 'development') === 'production',
  },

  // API 설정
  api: {
    baseUrl: getEnv('VITE_API_BASE_URL', 'http://localhost:8080/api'),
    timeout: getEnvNumber('VITE_API_TIMEOUT', 10000),
  },

  // 파일 업로드 설정
  upload: {
    maxFileSize: getEnvNumber('VITE_MAX_FILE_SIZE', 10485760), // 10MB
    allowedFileTypes: getEnvArray('VITE_ALLOWED_FILE_TYPES'),
    maxImageWidth: getEnvNumber('VITE_MAX_IMAGE_WIDTH', 1024),
    maxImageHeight: getEnvNumber('VITE_MAX_IMAGE_HEIGHT', 1024),
  },

  // 기능 설정
  features: {
    itemsPerPage: getEnvNumber('VITE_ITEMS_PER_PAGE', 20),
    paginationSize: getEnvNumber('VITE_PAGINATION_SIZE', 30),
    searchDebounce: getEnvNumber('VITE_SEARCH_DEBOUNCE', 500),
    cacheDuration: getEnvNumber('VITE_CACHE_DURATION', 300000), // 5분
    toastDuration: getEnvNumber('VITE_TOAST_DURATION', 3000), // 3초
  },

  // 인증 설정
  auth: {
    tokenKey: getEnv('VITE_AUTH_TOKEN_KEY', 'd-class-auth-token'),
    refreshTokenKey: getEnv('VITE_REFRESH_TOKEN_KEY', 'd-class-refresh-token'),
    tokenRefreshBefore: getEnvNumber('VITE_TOKEN_REFRESH_BEFORE', 5), // 5분 전
  },

  // 디버그 설정
  debug: {
    mode: getEnvBoolean('VITE_DEBUG_MODE', false),
    logApi: getEnvBoolean('VITE_LOG_API', false),
    logLevel: getEnv('VITE_LOG_LEVEL', 'info'),
  },

  // 외부 서비스
  services: {
    googleMaps: {
      apiKey: getEnv('VITE_GOOGLE_MAPS_API_KEY', ''),
    },
    firebase: {
      apiKey: getEnv('VITE_FIREBASE_API_KEY', ''),
      authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', ''),
      projectId: getEnv('VITE_FIREBASE_PROJECT_ID', ''),
      storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', ''),
      messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', ''),
      appId: getEnv('VITE_FIREBASE_APP_ID', ''),
    },
  },

  // PWA 설정
  pwa: {
    enabled: getEnvBoolean('VITE_ENABLE_PWA', true),
    offlineEnabled: getEnvBoolean('VITE_ENABLE_OFFLINE', true),
  },
}

/**
 * 현재 환경이 개발 환경인지 확인
 * @returns {boolean}
 */
export const isDevelopment = () => env.app.isDevelopment

/**
 * 현재 환경이 프로덕션 환경인지 확인
 * @returns {boolean}
 */
export const isProduction = () => env.app.isProduction

/**
 * 디버그 모드가 활성화되어 있는지 확인
 * @returns {boolean}
 */
export const isDebugMode = () => env.debug.mode

/**
 * 환경변수 검증 및 필수 값 확인
 * @throws {Error} 필수 환경변수가 없을 경우
 */
export const validateEnv = () => {
  const requiredEnvs = [
    { key: 'VITE_API_BASE_URL', value: env.api.baseUrl },
    { key: 'VITE_APP_NAME', value: env.app.name },
    { key: 'VITE_APP_VERSION', value: env.app.version },
  ]

  const missing = requiredEnvs.filter(({ value }) => !value)

  if (missing.length > 0) {
    const missingKeys = missing.map(({ key }) => key).join(', ')
    throw new Error(`필수 환경변수가 설정되지 않았습니다: ${missingKeys}`)
  }

  if (env.debug.mode) {
    console.log('✅ 환경변수 검증 완료')
    console.log('📋 현재 환경:', env.app.env)
    console.log('🔗 API URL:', env.api.baseUrl)
  }
}

export default env

