/**
 * 유효성 검증 함수들
 */

// 이메일 검증
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 비밀번호 검증 (8자 이상, 영문/숫자/특수문자 포함)
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
  return passwordRegex.test(password)
}

// 비밀번호 강도 체크
export const getPasswordStrength = (password) => {
  if (!password) return 'none'
  if (password.length < 8) return 'weak'

  let strength = 0
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  if (strength < 3) return 'weak'
  if (strength === 3) return 'medium'
  return 'strong'
}

// 전화번호 검증
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/
  return phoneRegex.test(phone)
}

// 전화번호 포맷팅 (010-1234-5678)
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }
  return phone
}

// 전화번호 마스킹 (채용 확정 전)
export const maskPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/)
  if (match) {
    return `${match[1]}-****-${match[3]}`
  }
  return phone
}

// 파일 크기 검증
export const validateFileSize = (file, maxSize = 10 * 1024 * 1024) => {
  return file.size <= maxSize
}

// 파일 타입 검증
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) => {
  return allowedTypes.includes(file.type)
}

// 파일 확장자 검증
export const validateFileExtension = (fileName, allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']) => {
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
  return allowedExtensions.includes(extension)
}

// 급여 입력 검증
export const validateSalary = (salary) => {
  return !isNaN(salary) && parseFloat(salary) > 0
}

// 텍스트 길이 검증
export const validateTextLength = (text, minLength = 0, maxLength = Infinity) => {
  const length = text.trim().length
  return length >= minLength && length <= maxLength
}

// 필수 필드 검증
export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  if (Array.isArray(value)) {
    return value.length > 0
  }
  return value !== null && value !== undefined
}

