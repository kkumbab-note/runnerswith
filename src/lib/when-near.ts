/**
 * 미리 만든 HTML 속 영역이 화면 가까이(기본 800px) 오거나, 그 안을 누르거나 키보드로 들어오면 끝나는 약속이에요.
 * 서버 렌더링·개발 서버처럼 요소가 아직 없으면 바로 끝나요.
 */
export function whenNear(id: string, margin = "800px") {
  if (typeof window === "undefined") return Promise.resolve()
  const el = document.getElementById(id)
  if (!el || !("IntersectionObserver" in window)) return Promise.resolve()
  return new Promise<void>((resolve) => {
    const done = () => {
      io.disconnect()
      el.removeEventListener("focusin", done)
      el.removeEventListener("pointerdown", done)
      resolve()
    }
    const io = new IntersectionObserver((entries) => entries.some((entry) => entry.isIntersecting) && done(), {
      rootMargin: `${margin} 0px`,
    })
    io.observe(el)
    el.addEventListener("focusin", done)
    el.addEventListener("pointerdown", done)
  })
}
