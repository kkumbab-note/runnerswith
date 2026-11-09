import { useSyncExternalStore } from "react"

export interface Store<T> {
  get: () => T
  set: (next: T) => void
  subscribe: (listener: () => void) => () => void
  /** 미리 만든 HTML과 하이드레이션 첫 화면에서 쓰는 값 */
  initial: T
}

/**
 * 컴포넌트 밖에서 값을 바꾸고 필요한 컴포넌트만 다시 그리는 작은 저장소.
 * App 전체를 다시 그리지 않아야, 아직 하이드레이션 전인 영역(FAQ·주문 폼)이 미리 만든 HTML을 버리지 않아요.
 */
export function createStore<T>(initial: T): Store<T> {
  let value = initial
  const listeners = new Set<() => void>()
  return {
    initial,
    get: () => value,
    set(next) {
      value = next
      listeners.forEach((listener) => listener())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

export function useStore<T>(store: Store<T>) {
  return useSyncExternalStore(store.subscribe, store.get, () => store.initial)
}
