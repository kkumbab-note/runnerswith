import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Collection } from "@/components/site/collection"
import { Faq } from "@/components/site/faq"
import { Hero } from "@/components/site/hero"
import { HowToBuy } from "@/components/site/how-to-buy"
import { Marquee } from "@/components/site/marquee"
import { OrderForm } from "@/components/site/order-form"
import { ProductDialog } from "@/components/site/product-dialog"
import { INQUIRY_LABEL, SiteContext, type OrderPrefill, type SiteActions } from "@/components/site/site-context"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { Story } from "@/components/site/story"
import { MotionProvider, scrollBehavior } from "@/hooks/use-motion"
import { findProduct, type ProductId } from "@/lib/products"

const productFromHash = () => {
  const match = window.location.hash.match(/^#product-([\w-]+)$/)
  return match && findProduct(match[1]!) ? (match[1] as ProductId) : null
}

export default function App() {
  const [productId, setProductId] = useState<ProductId | null>(productFromHash)
  const [prefill, setPrefill] = useState<OrderPrefill | null>(null)

  // #product-… 링크로 이동하면 해당 제품 상세를 열어요
  useEffect(() => {
    const onHash = () => {
      const id = productFromHash()
      if (id) setProductId(id)
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  const actions = useMemo<SiteActions>(
    () => ({
      openProduct: setProductId,
      prefillOrder: (p) => {
        setPrefill({ ...p, key: Date.now() })
        document.getElementById("order")?.scrollIntoView({ behavior: scrollBehavior() })
        const what = p.productId ? findProduct(p.productId)?.name : p.type ? INQUIRY_LABEL[p.type] : undefined
        if (what) toast(`‘${what}’ 문의로 폼을 채워뒀어요.`)
      },
    }),
    [],
  )

  return (
    <MotionProvider>
      <SiteContext.Provider value={actions}>
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          본문 바로가기
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          <Hero />
          <Marquee />
          <Collection />
          <Story />
          <HowToBuy />
          <Faq />
          <OrderForm prefill={prefill} />
        </main>
        <SiteFooter />
        <ProductDialog productId={productId} onClose={() => setProductId(null)} />
        <Toaster position="bottom-center" />
      </SiteContext.Provider>
    </MotionProvider>
  )
}
