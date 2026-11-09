// 사이트 문구에 실제로 쓰인 글자만 남겨 글꼴 파일을 작게 만들어요.
//
//   npm run fonts          글꼴을 다시 만들어요 (문구를 바꾼 뒤 실행)
//   node scripts/fonts.mjs --check   새 글자가 생겼는지만 확인해요 (빌드 때 자동 실행)
//
// 빠진 글자가 있어도 화면이 깨지지는 않아요. index.html이 페이지 로드 후 Pretendard 원본에서
// 그 글자 조각만 받아 오기 때문이에요. 다만 첫 화면부터 같은 글꼴로 보이도록 다시 만들어 두는 게 좋아요.
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { dirname, extname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const outDir = join(root, "src/assets/fonts")
const charsFile = join(outDir, "subset-chars.txt")
const cacheDir = join(root, "node_modules/.cache/runnerswith-fonts")

const PRETENDARD_URL = "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2"
const FRAUNCES_SRC = join(root, "node_modules/@fontsource-variable/fraunces/files/fraunces-latin-opsz-italic.woff2")
/** Fraunces는 영문 한 단어(with)에만 써요. 문구가 바뀌어도 되도록 알파벳 전체를 남겨요 */
const FRAUNCES_TEXT = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,’'-"

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else yield path
  }
}

/** 주석을 뺀 소스에서 화면에 나올 수 있는 글자를 모아요 */
async function usedCharacters() {
  const chars = new Set()
  for (let code = 0x20; code < 0x7f; code++) chars.add(String.fromCharCode(code))
  for await (const file of walk(join(root, "src"))) {
    if (![".ts", ".tsx", ".css"].includes(extname(file))) continue
    const source = (await readFile(file, "utf8"))
      .replace(/\/\*[\s\S]*?\*\//g, "") // 블록 주석, JSX 주석
      .replace(/(^|\s)\/\/.*$/gm, "$1") // 줄 주석 (https:// 같은 주소는 건드리지 않아요)
    for (const ch of source) if (ch.codePointAt(0) > 0x7f && !/\s/.test(ch)) chars.add(ch)
  }
  return [...chars].sort((a, b) => a.codePointAt(0) - b.codePointAt(0)).join("")
}

async function pretendardSource() {
  const cached = join(cacheDir, "PretendardVariable.woff2")
  if (existsSync(cached)) return readFile(cached)
  const res = await fetch(PRETENDARD_URL)
  if (!res.ok) throw new Error(`Pretendard 원본을 받지 못했어요 (${res.status})`)
  const buffer = Buffer.from(await res.arrayBuffer())
  await mkdir(cacheDir, { recursive: true })
  await writeFile(cached, buffer)
  return buffer
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)}KB`

async function build() {
  const { default: subsetFont } = await import("subset-font")
  const text = await usedCharacters()
  await mkdir(outDir, { recursive: true })

  // 화면에서 쓰는 굵기(font-normal 400 ~ font-semibold 600)만 남겨요. 더 굵게 쓰려면 max를 올려주세요
  const pretendard = await subsetFont(await pretendardSource(), text, {
    targetFormat: "woff2",
    variationAxes: { wght: { min: 400, max: 600 } },
  })
  await writeFile(join(outDir, "pretendard-subset.woff2"), pretendard)

  const fraunces = await subsetFont(await readFile(FRAUNCES_SRC), FRAUNCES_TEXT, {
    targetFormat: "woff2",
    variationAxes: { wght: 400 },
  })
  await writeFile(join(outDir, "fraunces-italic-subset.woff2"), fraunces)

  await writeFile(charsFile, text)
  console.log(`글자 ${[...text].length}자 · Pretendard ${kb(pretendard.length)} · Fraunces ${kb(fraunces.length)}`)
}

async function check() {
  if (!existsSync(charsFile)) {
    console.warn("[fonts] 글꼴 서브셋이 없어요. `npm run fonts`를 실행해 주세요.")
    return
  }
  const known = new Set(await readFile(charsFile, "utf8"))
  const missing = [...(await usedCharacters())].filter((ch) => !known.has(ch))
  if (missing.length === 0) return
  console.warn(`[fonts] 글꼴 서브셋에 없는 글자 ${missing.length}자: ${missing.join("")}`)
  console.warn("[fonts] 화면은 정상이지만, 첫 화면부터 같은 글꼴로 보이려면 `npm run fonts`를 실행해 주세요.")
}

await (process.argv.includes("--check") ? check() : build())
