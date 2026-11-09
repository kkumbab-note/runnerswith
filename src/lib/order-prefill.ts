import type { InquiryType } from "@/components/site/site-context"
import type { ProductId } from "@/lib/products"
import { createStore, useStore } from "@/lib/store"

export interface OrderPrefill {
  type?: InquiryType
  productId?: ProductId
  /** 같은 값으로 다시 채워도 반영되도록 매번 바뀌는 키 */
  key: number
}

/**
 * 제품 카드·구매 방법 버튼에서 주문 폼을 미리 채우는 저장소.
 * 폼 코드가 늦게 도착해도(나눠 받기) 마지막 요청을 그대로 받아요.
 */
const store = createStore<OrderPrefill | null>(null)

export const orderPrefill = {
  set: (prefill: Omit<OrderPrefill, "key">) => store.set({ ...prefill, key: Date.now() }),
}

export const useOrderPrefill = () => useStore(store)
