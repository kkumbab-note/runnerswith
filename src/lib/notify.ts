import { createStore, useStore } from "@/lib/store"

type Show = (message: string) => void

let show: Show | null = null
const queue: string[] = []
const requested = createStore(false)

/** 알림을 띄워요. 알림 코드(sonner)는 처음 알림을 띄울 때 받아요 */
export function notify(message: string) {
  if (show) {
    show(message)
    return
  }
  queue.push(message)
  if (!requested.get()) requested.set(true)
}

/** ToasterHost가 붙은 뒤 밀린 알림을 띄우고, 그다음부터는 바로 띄우게 해요 */
export function attachToaster(fn: Show) {
  show = fn
  queue.splice(0).forEach(fn)
  return () => {
    show = null
  }
}

export const useToasterRequested = () => useStore(requested)
