// 빌드한 index.html의 빈 <div id="root"></div>에 미리 만든 첫 화면 HTML을 채워요.
// 검색엔진·미리보기·스크립트가 꺼진 브라우저도 내용을 바로 볼 수 있어요.
import { readFile, rm, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const ssrDir = join(root, "dist-ssr")
const indexFile = join(root, "dist/index.html")
const EMPTY_ROOT = '<div id="root"></div>'

const { render, structuredData, siteUrl } = await import(pathToFileURL(join(ssrDir, "entry-server.js")).href)
const appHtml = await render()

let html = await readFile(indexFile, "utf8")
if (!html.includes(EMPTY_ROOT)) throw new Error(`dist/index.html에서 ${EMPTY_ROOT}를 찾지 못했어요`)
html = html.replace(EMPTY_ROOT, `<div id="root">${appHtml}</div>`)

// CSS를 HTML 안에 넣어요. 첫 화면을 그리기 전에 CSS 파일을 따로 받는 왕복이 사라져요.
// (CSS 안의 글꼴 주소는 /runnerswith/assets/… 처럼 절대 경로라 그대로 동작해요)
const cssLink = /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/
const match = html.match(cssLink)
if (!match) throw new Error("dist/index.html에서 CSS 링크를 찾지 못했어요")
const cssPath = join(root, "dist", match[1].replace(/^.*?\/assets\//, "assets/"))
const css = await readFile(cssPath, "utf8")
html = html.replace(cssLink, () => `<style>${css}</style>`)

// 제품 구조화 데이터(JSON-LD). src/lib/products.ts에서 만들어서 가격·이름이 화면과 항상 같아요
const jsonLd = JSON.stringify(structuredData()).replace(/</g, "\\u003c")
html = html.replace("</head>", () => `  <script type="application/ld+json">${jsonLd}</script>\n  </head>`)

await writeFile(indexFile, html)

// 검색엔진에 제출할 sitemap.xml (마지막 수정일 = 빌드한 날)
const today = new Date().toISOString().slice(0, 10)
await writeFile(
  join(root, "dist/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${today}</lastmod>
  </url>
</urlset>
`,
)
await rm(ssrDir, { recursive: true, force: true })

console.log(`미리 만든 HTML ${(appHtml.length / 1024).toFixed(1)}KB와 CSS ${(css.length / 1024).toFixed(1)}KB를 dist/index.html에 넣었어요`)
