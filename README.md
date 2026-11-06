# 러너스위드 Runners With

당신과 함께 달리는 일상을 위한 기어 — 러닝화·러닝 의류·러닝 장비 브랜드 원페이지 사이트.

- 사이트: https://kkumbab-note.github.io/runnerswith/
- Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui
- 제품 상세 갤러리와 3D 보기(three.js, 3D 탭을 열 때만 내려받아요)

## 개발

```bash
npm install
npm run dev        # 로컬 개발 서버
npm run build      # 타입 검사 + 프로덕션 빌드 (dist/)
npm run preview    # 빌드 결과 미리보기 (/runnerswith/)
```

`main` 브랜치에 푸시하면 GitHub Actions가 빌드해서 GitHub Pages로 배포해요.

## 바꿀 곳

| 항목 | 파일 |
| --- | --- |
| 판매 채널 URL·이메일·사업자 정보 | `src/lib/config.ts` |
| 제품 이름·가격·사진·스펙 | `src/lib/products.ts` |
| 이미지·로고·영상 | `public/` |
| 색·글꼴·모서리 토큰 | `src/index.css` |

> 제품·라이프스타일 사진과 히어로 영상은 AI로 만든 가상 이미지예요. 실제 판매 전에 실제 촬영본으로 교체해 주세요.
