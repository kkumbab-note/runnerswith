import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import App from "@/App"
import { initMotion } from "@/hooks/use-motion"
import { initAnalytics } from "@/lib/analytics"
import { loadFullPretendardOnInput } from "@/lib/fonts"
import "@/index.css"

// index.html의 안전장치에게 스크립트가 도착했다고 알려요 (등장 효과로 숨긴 내용을 계속 숨겨도 돼요)
;(window as Window & { __rwReady?: boolean }).__rwReady = true
initMotion()
loadFullPretendardOnInput()
initAnalytics()

const container = document.getElementById("root")!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

if (container.hasChildNodes()) {
  // 빌드 결과에는 미리 만든 HTML이 들어 있어서 그 위에 동작만 연결해요.
  // 첫 화면을 먼저 그린 뒤 시작해서, 가장 큰 콘텐츠(히어로 포스터)가 스크립트 실행을 기다리지 않게 해요.
  // 화면을 그리지 않는 숨은 탭에서도 시작되도록 짧은 대기 시간을 함께 둬요
  let started = false
  const hydrate = () => {
    if (started) return
    started = true
    hydrateRoot(container, app)
  }
  requestAnimationFrame(() => setTimeout(hydrate, 0))
  setTimeout(hydrate, 300)
} else {
  // 개발 서버에서는 처음부터 그려요
  createRoot(container).render(app)
}
