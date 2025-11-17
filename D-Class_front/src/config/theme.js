// 디자인 시스템 - 색상 팔레트
export const colors = {
  // Primary
  primary: '#A7C7E7', // Serene Blue
  accent: '#FAB4B4', // Soft Coral
  
  // Neutral
  background: '#F9F9F9',
  cardBackground: '#FFFFFF',
  primaryText: '#5D6D7E',
  secondaryText: '#AEB6BF',
  divider: '#EAEAEA',
  disabled: '#D5DBDB',
  
  // Semantic
  success: '#B2D8D8', // 파스텔 민트
  warning: '#FFE5A9', // 파스텔 옐로우
  error: '#FFB6C1', // 파스텔 핑크
  info: '#D4E5F7', // 연한 블루
}

// 타이포그래피
export const typography = {
  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  h1: {
    fontSize: '22px',
    fontWeight: 'bold',
    lineHeight: 1.4,
  },
  h2: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h3: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body: {
    fontSize: '16px',
    fontWeight: 'normal',
    lineHeight: 1.6,
  },
  bodySmall: {
    fontSize: '14px',
    fontWeight: 'normal',
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '12px',
    fontWeight: 'normal',
    lineHeight: 1.4,
  },
}

// 간격 시스템
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
}

// 모서리 둥글기
export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  full: '9999px',
}

// 그림자
export const shadows = {
  card: '0px 2px 8px rgba(0, 0, 0, 0.08)',
  modal: '0px 4px 16px rgba(0, 0, 0, 0.15)',
}
