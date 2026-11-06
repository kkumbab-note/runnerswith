import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

const STORAGE_KEY = "rw-motion"

interface MotionState {
  /** 마퀴·히어로 영상 같은 반복 모션이 멈춰 있는지 */
  paused: boolean
  /** 데이터 절약 모드에서 사용자가 직접 재생을 눌렀는지 */
  userStarted: boolean
  toggle: () => void
}

const MotionContext = createContext<MotionState | null>(null)

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

const readInitial = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return saved === "paused"
  } catch {
    // 저장소가 막혀 있으면 시스템 설정만 따라요
  }
  return prefersReducedMotion()
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(readInitial)
  const [userStarted, setUserStarted] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("motion-paused", paused)
    root.classList.toggle("motion-play", !paused)
  }, [paused])

  const toggle = useCallback(() => {
    const next = !paused
    setPaused(next)
    if (!next) setUserStarted(true)
    try {
      localStorage.setItem(STORAGE_KEY, next ? "paused" : "play")
    } catch {
      // 저장 실패는 무시해요
    }
  }, [paused])

  const value = useMemo(() => ({ paused, userStarted, toggle }), [paused, userStarted, toggle])
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}

export function useMotion() {
  const ctx = useContext(MotionContext)
  if (!ctx) throw new Error("useMotion은 MotionProvider 안에서만 쓸 수 있어요")
  return ctx
}

export const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? "auto" : "smooth")
