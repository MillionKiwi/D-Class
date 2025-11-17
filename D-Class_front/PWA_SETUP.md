# PWA 설정 가이드

D-Class 프론트엔드는 PWA (Progressive Web App)로 구성되어 있습니다.

## 현재 설정 상태

✅ PWA 플러그인 설치 및 설정 완료
✅ Service Worker 자동 생성 및 등록
✅ Manifest 파일 설정 완료
✅ 오프라인 캐싱 전략 설정 완료
⚠️ 아이콘 파일 준비 필요

## 아이콘 파일 준비

### 필요한 아이콘

다음 파일들을 `public` 폴더에 추가해야 합니다:

1. **pwa-192x192.png** (192x192px)
   - Android 홈 화면 아이콘
   - PWA manifest 아이콘

2. **pwa-512x512.png** (512x512px)
   - Android 스플래시 화면
   - PWA manifest 아이콘 (maskable)

3. **apple-touch-icon.png** (180x180px)
   - iOS 홈 화면 아이콘

4. **mask-icon.svg**
   - Safari 터치 바 아이콘

### 아이콘 생성 방법

1. 디자인 팀에서 제공받은 로고를 기반으로 생성
2. 온라인 도구 사용:
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator
3. 이미지 편집 도구 사용 (Figma, Photoshop 등)

## PWA 테스트

### 개발 환경

```bash
npm run dev
```

개발 모드에서도 PWA 기능을 테스트할 수 있습니다 (vite-plugin-pwa의 devOptions 설정).

### 프로덕션 빌드

```bash
npm run build
npm run preview
```

빌드 시 다음 파일들이 자동 생성됩니다:
- `dist/sw.js` - Service Worker 파일
- `dist/workbox-*.js` - Workbox 라이브러리
- `dist/manifest.webmanifest` - Manifest 파일

### Chrome DevTools에서 테스트

1. Chrome DevTools 열기 (F12)
2. **Application** 탭 선택
3. **Service Workers** 섹션에서 등록 상태 확인
4. **Manifest** 섹션에서 manifest 정보 확인
5. **Offline** 체크박스로 오프라인 동작 테스트

### 모바일에서 테스트

1. HTTPS 환경에서 배포 (PWA는 HTTPS 필수)
2. 모바일 브라우저에서 접속
3. 브라우저 메뉴에서 "홈 화면에 추가" 선택
4. 설치된 앱으로 실행 및 테스트

## 주요 기능

### 1. 오프라인 지원

Service Worker를 통해 다음 리소스가 캐시됩니다:
- HTML, CSS, JS 파일
- 이미지 파일 (PNG, SVG 등)
- 폰트 파일

### 2. API 캐싱

네트워크 우선 전략으로 API 응답을 캐시:
- 성공한 API 응답만 캐시
- 최대 50개 엔트리
- 24시간 유효기간

### 3. 자동 업데이트

- 새 버전이 배포되면 자동 감지
- 사용자에게 업데이트 알림
- 업데이트 후 자동 새로고침

## 커스터마이징

### 캐싱 전략 변경

`vite.config.js`의 `workbox.runtimeCaching` 설정을 수정하세요:

```javascript
runtimeCaching: [
  {
    urlPattern: /^https:\/\/api\.d-class\.com\/.*/i,
    handler: 'NetworkFirst', // 또는 'CacheFirst', 'StaleWhileRevalidate'
    // ...
  }
]
```

### Manifest 수정

`vite.config.js`의 `manifest` 설정을 수정하거나 `public/manifest.webmanifest` 파일을 직접 수정하세요.

## 문제 해결

### Service Worker가 등록되지 않음

- HTTPS 환경인지 확인 (localhost는 제외)
- 브라우저 콘솔에서 에러 확인
- Application 탭에서 Service Worker 상태 확인

### 아이콘이 표시되지 않음

- 아이콘 파일이 `public` 폴더에 있는지 확인
- 파일 경로가 올바른지 확인 (절대 경로 사용)
- 브라우저 캐시 삭제 후 재시도

### 업데이트가 적용되지 않음

- Service Worker를 수동으로 등록 해제:
  - Application 탭 > Service Workers > Unregister
- 브라우저 캐시 완전 삭제
- 새 브라우저 창에서 테스트

## 추가 리소스

- [PWA 가이드](https://web.dev/progressive-web-apps/)
- [vite-plugin-pwa 문서](https://vite-pwa-org.netlify.app/)
- [Workbox 문서](https://developers.google.com/web/tools/workbox)
