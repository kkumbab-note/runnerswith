import { useEffect } from "react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { attachToaster } from "@/lib/notify"

/** 처음 알림을 띄울 때 불러오는 알림 영역. Toaster가 붙은 다음(부모 효과)에 밀린 알림을 보내요 */
export function ToasterHost() {
  useEffect(() => attachToaster((message) => toast(message)), [])
  return <Toaster position="bottom-center" />
}
