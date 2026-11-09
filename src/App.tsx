import { lazy, Suspense, useEffect, useMemo, useState, type RefObject } from "react"
import { Collection } from "@/components/site/collection"
import { Hero } from "@/components/site/hero"
import { HowToBuy } from "@/components/site/how-to-buy"
import { Marquee } from "@/components/site/marquee"
import { INQUIRY_LABEL, SiteContext, type SiteActions } from "@/components/site/site-context"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Story } from "@/components/site/story"
import { scrollBehavior } from "@/hooks/use-motion"
import { track } from "@/lib/analytics"
import { notify, useToasterRequested } from "@/lib/notify"
import { orderPrefill } from "@/lib/order-prefill"
import { findProduct, type ProductId } from "@/lib/products"
import { createStore, useStore } from "@/lib/store"
import { whenNear } from "@/lib/when-near"

// 첫 화면에 필요 없는 부분은 따로 나눠 받아요.
// FAQ·주문 폼은 미리 만든 HTML이 먼저 보이고, 화면 가까이 오면 코드를 받아 그 위에 동작을 연결해요.
const Faq = lazy(() =>
  whenNear("faq")
    .then(() => import("@/components/site/faq"))
    .then((m) => ({ default: m.Faq })),
)
const OrderForm = lazy(() =>
  whenNear("order")
    .then(() => import("@/components/site/order-form"))
    .then((m) => ({ default: m.OrderForm })),
)
// 제품 상세 모달은 컬렉션이 보이기 시작할 때 미리 받거나, 처음 열 때 받아요
const loadProductDialog = () => import("@/components/site/product-dialog")
const ProductDialog = lazy(() => loadProductDialog().then((m) => ({ default: m.ProductDialog })))
// 알림 영역(sonner)은 처음 알림을 띄울 때 받아요
const ToasterHost = lazy(() => import("@/components/site/toaster-host").then((m) => ({ default: m.ToasterHost })))

/** 열린 제품. App이 아니라 모달 영역만 다시 그리도록 저장소에 둬요 */
const openProduct = createStore<ProductId | null>(null)
/** 제품 모달을 닫을 때 포커스를 돌려줄 요소 */
const openerRef: RefObject<HTMLElement | null> = { current: null }

const productFromHash = () => {
  const match = window.location.hash.match(/^#product-([\w-]+)$/)
  return match && findProduct(match[1]!) ? (match[1] as ProductId) : null
}

function ProductDialogHost() {
  const productId = useStore(openProduct)
  // 한 번 연 모달은 닫힘 애니메이션과 포커스 복귀를 위해 계속 붙여 둬요
  const [mounted, setMounted] = useState(false)
  if (productId && !mounted) setMounted(true)

  // #product-… 링크로 들어오거나 이동하면 해당 제품 상세를 열어요
  useEffect(() => {
    const sync = () => {
      const id = productFromHash()
      if (!id) return
      openerRef.current = null
      openProduct.set(id)
    }
    sync()
    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [])

  useEffect(() => {
    void whenNear("collection", "0px").then(() => loadProductDialog().catch(() => undefined))
  }, [])

  if (!mounted) return null
  return (
    <Suspense fallback={null}>
      <ProductDialog productId={productId} onClose={() => openProduct.set(null)} returnFocusRef={openerRef} />
    </Suspense>
  )
}

function LazyToaster() {
  const requested = useToasterRequested()
  if (!requested) return null
  return (
    <Suspense fallback={null}>
      <ToasterHost />
    </Suspense>
  )
}

export default function App() {
  // App은 하이드레이션 뒤 다시 그려지지 않아요. 상태는 각 영역(모달·알림·주문 폼)이 저장소로 따로 받아요
  const actions = useMemo<SiteActions>(
    () => ({
      openProduct: (id) => {
        openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        openProduct.set(id)
        track("view_item", { item_id: id })
      },
      prefillOrder: (p) => {
        orderPrefill.set(p)
        track("prefill_order", { inquiry_type: p.type, item_id: p.productId })
        // 폼으로 옮겨 간 뒤에는 키보드 사용자도 바로 이름부터 입력할 수 있게 해요
        const nameField = document.getElementById("f-name")
        openerRef.current = nameField
        nameField?.focus({ preventScroll: true })
        document.getElementById("order")?.scrollIntoView({ behavior: scrollBehavior() })
        const what = p.productId ? findProduct(p.productId)?.name : p.type ? INQUIRY_LABEL[p.type] : undefined
        if (what) notify(`‘${what}’ 문의로 폼을 채워뒀어요.`)
      },
    }),
    [],
  )

  return (
    <SiteContext.Provider value={actions}>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        본문 바로가기
      </a>
      <SiteHeader />
      {/* Suspense로 나눈 영역은 머리글·히어로를 먼저 연결한 뒤 한가할 때 차례로 연결돼요 (긴 작업 쪼개기) */}
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Suspense fallback={null}>
          <Marquee />
        </Suspense>
        <Suspense fallback={null}>
          <Collection />
        </Suspense>
        <Suspense fallback={null}>
          <Story />
        </Suspense>
        <Suspense fallback={null}>
          <HowToBuy />
        </Suspense>
        <Suspense fallback={null}>
          <Faq />
        </Suspense>
        <Suspense fallback={null}>
          <OrderForm />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
      <ProductDialogHost />
      <LazyToaster />
    </SiteContext.Provider>
  )
}
