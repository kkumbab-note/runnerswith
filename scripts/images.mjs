// 화면 크기별 이미지(480·720px 등)와 갤러리 썸네일을 만들고, 크기 정보를 src/lib/image-manifest.ts에 적어요.
//
//   npm run images     public/images의 원본을 바꾸거나 추가한 뒤 실행해요
import { readdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const imagesDir = join(root, "public/images")
const manifestFile = join(root, "src/lib/image-manifest.ts")

/** 파일 이름 규칙별로 만들 폭(px). 원본보다 큰 폭은 만들지 않아요 */
const RULES = [
  { test: /^p\d{2}-(main|d\d)$/, widths: [160, 480, 720] }, // 제품 카드·갤러리 (160은 썸네일)
  { test: /^hero-a$/, widths: [640] }, // 히어로 영상 포스터 (첫 화면 LCP)
  { test: /^hero-b$/, widths: [320, 480, 720] },
  { test: /^story$/, widths: [768, 1152] },
]
const VARIANT = /-\d+$/

const files = (await readdir(imagesDir)).filter((f) => f.endsWith(".webp")).sort()
const manifest = {}

for (const file of files) {
  const name = file.replace(/\.webp$/, "")
  if (VARIANT.test(name)) continue
  const rule = RULES.find((r) => r.test.test(name))
  if (!rule) continue

  const source = join(imagesDir, file)
  const { width, height } = await sharp(source).metadata()
  const variants = rule.widths.filter((w) => w < width)
  for (const w of variants) {
    await sharp(source)
      .resize({ width: w })
      .webp({ quality: w <= 160 ? 70 : 76, effort: 6 })
      .toFile(join(imagesDir, `${name}-${w}.webp`))
  }
  manifest[`images/${file}`] = { width, height, variants }
  console.log(`${file} ${width}×${height} → ${variants.join(", ")}`)
}

const body = Object.entries(manifest)
  .map(([src, info]) => `  "${src}": { width: ${info.width}, height: ${info.height}, variants: [${info.variants.join(", ")}] },`)
  .join("\n")

await writeFile(
  manifestFile,
  `// scripts/images.mjs가 만든 파일이에요. 직접 고치지 말고 \`npm run images\`를 실행해 주세요.

export interface ImageInfo {
  width: number
  height: number
  /** 미리 만들어 둔 폭(px). 파일 이름은 원본 이름-폭.webp 이에요 */
  variants: readonly number[]
}

export const IMAGE_MANIFEST: Record<string, ImageInfo> = {
${body}
}
`,
)
