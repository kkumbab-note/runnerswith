import { asset } from "@/lib/config"
import { IMAGE_MANIFEST } from "@/lib/image-manifest"

const variantPath = (src: string, width: number) => src.replace(/\.webp$/, `-${width}.webp`)

/**
 * 화면 크기에 맞는 이미지를 브라우저가 고르도록 src·srcSet·sizes·크기를 만들어요.
 * sizes에는 실제로 보이는 폭을 적어요. 예: "(min-width: 1024px) 352px, calc(100vw - 32px)"
 */
export function responsiveImage(src: string, sizes: string) {
  const info = IMAGE_MANIFEST[src]
  if (!info) return { src: asset(src) }
  const candidates = [...info.variants.map((w) => `${asset(variantPath(src, w))} ${w}w`), `${asset(src)} ${info.width}w`]
  return { src: asset(src), srcSet: candidates.join(", "), sizes, width: info.width, height: info.height }
}

/** 갤러리 썸네일용 작은 이미지 (없으면 원본) */
export function thumbnailImage(src: string, width = 160) {
  return IMAGE_MANIFEST[src]?.variants.includes(width) ? asset(variantPath(src, width)) : asset(src)
}
