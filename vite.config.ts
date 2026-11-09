import { fileURLToPath, URL } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

/**
 * 히어로 제목에 쓰는 글꼴을 미리 받아요. 늦게 도착하면 제목 높이가 바뀌며 옆 이미지가 밀려요(레이아웃 이동).
 * 파일 이름에 해시가 붙어서, 빌드가 끝난 뒤 실제 파일 이름으로 <link rel="preload">를 넣어요.
 */
function preloadFonts(patterns: RegExp[]): Plugin {
  let base = "/"
  return {
    name: "runnerswith:preload-fonts",
    apply: "build",
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        if (!ctx.bundle) return
        return Object.values(ctx.bundle)
          .filter((file) => file.type === "asset" && patterns.some((p) => p.test(file.fileName)))
          .map((file) => ({
            tag: "link",
            attrs: { rel: "preload", as: "font", type: "font/woff2", href: base + file.fileName, crossorigin: "" },
            injectTo: "head" as const,
          }))
      },
    },
  }
}

// GitHub Pages 프로젝트 주소(/runnerswith/)에 맞춰 빌드해요.
// 자체 도메인을 연결하면 BASE_PATH=/ 로 빌드하면 돼요.
// 3D 뷰어(three.js)는 동적 import라 별도 청크로 나뉘어, 3D 탭을 열 때만 내려받아요.
export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? (process.env.BASE_PATH ?? "/runnerswith/") : "/",
  plugins: [react(), tailwindcss(), preloadFonts([/geist-latin-wght-normal-[\w-]+\.woff2$/, /fraunces-italic-subset-[\w-]+\.woff2$/])],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
}))
