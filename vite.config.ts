import { fileURLToPath, URL } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// GitHub Pages 프로젝트 주소(/runnerswith/)에 맞춰 빌드해요.
// 자체 도메인을 연결하면 BASE_PATH=/ 로 빌드하면 돼요.
// 3D 뷰어(three.js)는 동적 import라 별도 청크로 나뉘어, 3D 탭을 열 때만 내려받아요.
export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? (process.env.BASE_PATH ?? "/runnerswith/") : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
}))
