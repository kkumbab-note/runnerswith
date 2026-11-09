import { useSyncExternalStore } from "react"

const STORAGE_KEY = "rw-motion"

interface MotionSnapshot {
  /** 마퀴·히어로 영상 같은 반복 모션이 멈춰 있는지 */
  paused: boolean
  /** 데이터 절약 모드에서 사용자가 직접 재생을 눌렀는지 */
  userStarted: boolean
  /** 저장된 설정을 읽었는지. 미리 만든 HTML과 하이드레이션 중에는 false예요 */
  ready: boolean
}

/** 미리 만든 HTML과 하이드레이션 첫 화면이 같도록 쓰는 기본값 */
const SERVER_SNAPSHOT: MotionSnapshot = { paused: false, userStarted: false, ready: false }
let snapshot = SERVER_SNAPSHOT
const listeners = new Set<() => void>()

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

function update(next: Partial<MotionSnapshot>, { syncClasses = true } = {}) {
  snapshot = { ...snapshot, ...next }
  if (syncClasses) {
    // CSS 반복 모션(마퀴 등)은 html 클래스로 멈추고 재생해요. index.html의 인라인 스크립트와 같은 규칙이에요
    const root = document.documentElement
    root.classList.toggle("motion-paused", snapshot.paused)
    root.classList.toggle("motion-play", !snapshot.paused)
  }
  listeners.forEach((listener) => listener())
}

/** 저장된 설정, 없으면 시스템 '동작 줄이기' 설정으로 첫 상태를 정해요. main.tsx에서 한 번 불러요 */
export function initMotion() {
  let paused = prefersReducedMotion()
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) paused = saved === "paused"
  } catch {
    // 저장소가 막혀 있으면 시스템 설정만 따라요
  }
  // html 클래스는 index.html이 첫 화면 전에 이미 맞춰 뒀어요. 다시 바꾸면 문서 전체 스타일을 또 계산해요
  update({ paused, ready: true }, { syncClasses: false })
}

function toggleMotion() {
  const paused = !snapshot.paused
  update({ paused, userStarted: snapshot.userStarted || !paused })
  try {
    localStorage.setItem(STORAGE_KEY, paused ? "paused" : "play")
  } catch {
    // 저장 실패는 무시해요
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useMotion() {
  const state = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => SERVER_SNAPSHOT,
  )
  return { ...state, toggle: toggleMotion }
}

export const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? "auto" : "smooth")
