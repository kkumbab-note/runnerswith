import { createContext, useContext } from "react"
import type { ProductId } from "@/lib/products"

export type InquiryType = "personal" | "group" | "wholesale" | "etc"

export const INQUIRY_LABEL: Record<InquiryType, string> = {
  personal: "개인 구매",
  group: "단체 구매",
  wholesale: "협업·도매",
  etc: "기타 문의",
}

export interface SiteActions {
  openProduct: (id: ProductId) => void
  prefillOrder: (prefill: { type?: InquiryType; productId?: ProductId }) => void
}

export const SiteContext = createContext<SiteActions | null>(null)

export function useSite() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error("useSite는 SiteContext 안에서만 쓸 수 있어요")
  return ctx
}
