// 장르 한글 변환
export const genreLabels = {
  ballet: '발레',
  contemporary: '현대무용',
  korean: '한국무용',
  jazz: '재즈댄스',
  hiphop: '힙합',
  ballroom: '볼룸댄스',
  etc: '기타',
}

// 요일 한글 변환
export const dayLabels = {
  monday: '월요일',
  tuesday: '화요일',
  wednesday: '수요일',
  thursday: '목요일',
  friday: '금요일',
  saturday: '토요일',
  sunday: '일요일',
}

// 장르 배열을 한글로 변환
export const formatGenres = (genres) => {
  if (!Array.isArray(genres)) return ''
  return genres.map((genre) => genreLabels[genre] || genre).join(', ')
}

// 요일 배열을 한글로 변환
export const formatDays = (days) => {
  if (!Array.isArray(days)) return ''
  return days.map((day) => dayLabels[day] || day).join(', ')
}

// 단일 장르 변환
export const getGenreLabel = (genre) => {
  return genreLabels[genre] || genre
}

// 단일 요일 변환
export const getDayLabel = (day) => {
  return dayLabels[day] || day
}

