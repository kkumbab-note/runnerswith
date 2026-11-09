// scripts/images.mjs가 만든 파일이에요. 직접 고치지 말고 `npm run images`를 실행해 주세요.

export interface ImageInfo {
  width: number
  height: number
  /** 미리 만들어 둔 폭(px). 파일 이름은 원본 이름-폭.webp 이에요 */
  variants: readonly number[]
}

export const IMAGE_MANIFEST: Record<string, ImageInfo> = {
  "images/hero-a.webp": { width: 960, height: 1440, variants: [640] },
  "images/hero-b.webp": { width: 960, height: 1440, variants: [320, 480, 720] },
  "images/p01-d1.webp": { width: 960, height: 960, variants: [160, 480, 720] },
  "images/p01-d2.webp": { width: 960, height: 1440, variants: [160, 480, 720] },
  "images/p01-d3.webp": { width: 960, height: 960, variants: [160, 480, 720] },
  "images/p01-main.webp": { width: 960, height: 1440, variants: [160, 480, 720] },
  "images/p02-d1.webp": { width: 960, height: 960, variants: [160, 480, 720] },
  "images/p02-d2.webp": { width: 960, height: 1440, variants: [160, 480, 720] },
  "images/p02-d3.webp": { width: 960, height: 960, variants: [160, 480, 720] },
  "images/p02-main.webp": { width: 960, height: 1440, variants: [160, 480, 720] },
  "images/p03-d1.webp": { width: 960, height: 960, variants: [160, 480, 720] },
  "images/p03-d2.webp": { width: 960, height: 1440, variants: [160, 480, 720] },
  "images/p03-d3.webp": { width: 960, height: 960, variants: [160, 480, 720] },
  "images/p03-main.webp": { width: 960, height: 1440, variants: [160, 480, 720] },
  "images/p04-d1.webp": { width: 960, height: 960, variants: [160, 480, 720] },
  "images/p04-d2.webp": { width: 960, height: 1440, variants: [160, 480, 720] },
  "images/p04-d3.webp": { width: 960, height: 960, variants: [160, 480, 720] },
  "images/p04-main.webp": { width: 960, height: 1440, variants: [160, 480, 720] },
  "images/p05-d1.webp": { width: 960, height: 960, variants: [160, 480, 720] },
  "images/p05-d2.webp": { width: 960, height: 1440, variants: [160, 480, 720] },
  "images/p05-d3.webp": { width: 960, height: 960, variants: [160, 480, 720] },
  "images/p05-main.webp": { width: 960, height: 1440, variants: [160, 480, 720] },
  "images/p06-d1.webp": { width: 960, height: 960, variants: [160, 480, 720] },
  "images/p06-d2.webp": { width: 960, height: 1440, variants: [160, 480, 720] },
  "images/p06-d3.webp": { width: 960, height: 960, variants: [160, 480, 720] },
  "images/p06-main.webp": { width: 960, height: 1440, variants: [160, 480, 720] },
  "images/story.webp": { width: 1536, height: 1024, variants: [768, 1152] },
}
