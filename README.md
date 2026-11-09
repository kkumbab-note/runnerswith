# 러너스위드 Runners With

당신과 함께 달리는 일상을 위한 기어 — 러닝화·러닝 의류·러닝 장비 브랜드 원페이지 사이트.

- 사이트: https://kkumbab-note.github.io/runnerswith/
- Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui
- 제품 상세 갤러리와 3D 보기(three.js, 3D 탭을 열 때만 내려받아요)

## 개발

```bash
npm install
npm run dev        # 로컬 개발 서버
npm run build      # 타입 검사 + 프로덕션 빌드 + 첫 화면 HTML 미리 만들기 (dist/)
npm run preview    # 빌드 결과 미리보기 (/runnerswith/)
```

`main` 브랜치에 푸시하면 GitHub Actions가 빌드해서 GitHub Pages로 배포해요.

### 빌드가 하는 일

1. `scripts/fonts.mjs --check` — 화면 문구에 글꼴 서브셋에 없는 글자가 생겼는지 알려줘요.
2. `vite build` — 브라우저용 코드. FAQ·주문 폼·제품 상세·알림은 따로 나눠서, 필요할 때 받아요.
3. `vite build --ssr` + `scripts/prerender.mjs` — 첫 화면 HTML을 미리 만들어 `dist/index.html`에 넣어요.
   CSS 인라인, 제품 구조화 데이터(JSON-LD), `sitemap.xml`도 이때 만들어요.

### 문구·이미지를 바꾼 뒤

```bash
npm run fonts      # 새 글자를 글꼴 서브셋에 넣어요 (빌드가 알려주면 실행)
npm run images     # public/images 원본을 바꾸거나 추가했을 때 화면 크기별 이미지를 다시 만들어요
```

빠진 글자가 있어도 화면은 깨지지 않아요. 입력칸을 쓰기 시작하면 Pretendard 원본에서 그 글자만 받아요.

## 바꿀 곳

| 항목 | 파일 |
| --- | --- |
| 판매 채널 URL·이메일·사업자 정보·대표 주소 | `src/lib/config.ts` |
| GA4 측정 ID (`analytics.ga4Id`) | `src/lib/config.ts` |
| 제품 이름·가격·사진·스펙 (구조화 데이터에도 그대로 쓰여요) | `src/lib/products.ts` |
| 이미지·로고·영상 | `public/` (이미지를 바꾸면 `npm run images`) |
| 색·글꼴·모서리 토큰 | `src/index.css` |
| 히어로 포스터(첫 화면 LCP) | `src/components/site/hero.tsx`의 `HERO_POSTER`와 `index.html`의 preload를 함께 |

## 유입 경로와 측정

- 스마트스토어 링크에는 누른 위치가 붙어요: `nt_source=runnerswith_web&nt_medium=homepage&nt_detail=card|detail|summary|how-to-buy`
  (스마트스토어 센터 > 통계 > 마케팅 분석에서 확인) 와 같은 값의 `utm_*`(GA4용).
- `analytics.ga4Id`를 넣으면 페이지 로드 후 GA4가 붙고 다음 행동이 기록돼요.
  `view_item`(제품 상세) · `prefill_order`(문의 폼 채우기) · `generate_lead`(문의 요약 완료) · `contact`(채널 선택) · `click_store`(구매 링크).
  GA4를 켜면 개인정보처리방침에 쿠키·분석 도구 사용을 적어 주세요.

## 검색 노출

- 첫 화면 HTML이 미리 들어 있어서 스크립트 없이도 내용이 보여요.
- `sitemap.xml`은 `https://kkumbab-note.github.io/runnerswith/sitemap.xml`에 만들어져요. 구글 서치 콘솔·네이버 서치어드바이저에 직접 제출해 주세요.
- `robots.txt`는 도메인 맨 위(`kkumbab-note.github.io/robots.txt`)에 있어야 해서 이 저장소로는 둘 수 없어요. 자체 도메인을 연결하면 `public/robots.txt`로 추가할 수 있어요.

> 제품·라이프스타일 사진과 히어로 영상은 AI로 만든 가상 이미지예요. 실제 판매 전에 실제 촬영본으로 교체해 주세요.
