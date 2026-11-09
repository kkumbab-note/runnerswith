import { StrictMode } from "react"
import { prerender } from "react-dom/static"
import App from "@/App"
import { CONFIG, productLink } from "@/lib/config"
import { PRODUCTS } from "@/lib/products"

export const siteUrl = CONFIG.siteUrl

/** 빌드 때 첫 화면 HTML을 미리 만들어요 (scripts/prerender.mjs가 불러요). 나눠 받는 부분까지 모두 기다려요 */
export async function render() {
  const { prelude } = await prerender(
    <StrictMode>
      <App />
    </StrictMode>,
    // 큰 영역(FAQ·주문 폼)도 숨김 칸 + 교체 스크립트로 빼지 않고 제자리에 넣어요.
    // 그래야 스크립트가 꺼져 있거나 검색엔진이 읽을 때도 내용이 바로 보여요
    { progressiveChunkSize: Number.POSITIVE_INFINITY },
  )
  return new Response(prelude).text()
}

/** 검색 결과에 제품 정보(이름·가격·이미지)가 보일 수 있게 하는 구조화 데이터 */
export function structuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${CONFIG.brand} 컬렉션`,
    itemListElement: PRODUCTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        "@id": `${CONFIG.siteUrl}#product-${p.id}`,
        url: `${CONFIG.siteUrl}#product-${p.id}`,
        name: `${p.name} ${p.nameKo}`,
        description: p.summary,
        sku: p.id,
        category: p.category.ko,
        image: p.images.map((img) => new URL(img.src, CONFIG.siteUrl).href),
        brand: { "@type": "Brand", name: CONFIG.brand },
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: "KRW",
          availability: "https://schema.org/InStock",
          url: productLink(p.id),
        },
      },
    })),
  }
}
