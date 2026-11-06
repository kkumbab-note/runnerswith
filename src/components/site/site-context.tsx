import { createContext, useContext } from "react"
import type { ProductId } from "@/lib/products"

export type InquiryType = "personal" | "group" | "wholesale" | "etc"

export const INQUIRY_LABEL: Record<InquiryType, string> = {
  personal: "개인 구매",
  group: "단체 구매",
  wholesale: "협업·도매",
  etc: "기타 문의",
}

export interface OrderPrefill {
  type?: InquiryType
  productId?: ProductId
  /** 같은 값으로 다시 채워도 반영되도록 매번 바뀌는 키 */
  key: number
}

export interface SiteActions {
  openProduct: (id: ProductId) => void
  prefillOrder: (prefill: Omit<OrderPrefill, "key">) => void
}

export const SiteContext = createContext<SiteActions | null>(null)

export function useSite() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error("useSite는 SiteContext 안에서만 쓸 수 있어요")
  return ctx
}
