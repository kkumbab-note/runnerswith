import { CONFIG } from "@/lib/config"

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/** GA4 측정 ID(CONFIG.analytics.ga4Id)가 있으면 페이지 로드가 끝난 뒤 gtag.js를 붙여요. 첫 화면 속도에 영향을 주지 않아요 */
export function initAnalytics() {
  const id = CONFIG.analytics.ga4Id
  if (!id) return
  const dataLayer = (window.dataLayer ??= [])
  window.gtag = function gtag() {
    // gtag.js는 배열이 아니라 arguments 객체를 그대로 받아요
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments)
  }
  window.gtag("js", new Date())
  window.gtag("config", id)
  const load = () => {
    const script = document.createElement("script")
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
    document.head.append(script)
  }
  if (document.readyState === "complete") load()
  else window.addEventListener("load", load, { once: true })
}

type EventParams = Record<string, string | number | undefined>

/**
 * 주요 행동을 기록해요. GA4가 없으면 dataLayer(GTM)로만 남기고, 둘 다 없으면 아무 일도 하지 않아요.
 *   view_item 제품 상세 열기 · prefill_order 문의 폼 채우기 · generate_lead 문의 요약 완료
 *   contact 보낼 채널 선택 · click_store 스마트스토어 구매 링크
 */
export function track(event: string, params: EventParams = {}) {
  if (typeof window === "undefined") return
  if (window.gtag) window.gtag("event", event, params)
  else window.dataLayer?.push({ event, ...params })
}
