import { ArrowUpRight, Box } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Reveal } from "@/components/site/reveal"
import { SectionHeading } from "@/components/site/section-heading"
import { useSite } from "@/components/site/site-context"
import { asset, productLink } from "@/lib/config"
import { formatPrice, PRODUCTS, type Product } from "@/lib/products"

function ProductCard({ product }: { product: Product }) {
  const { openProduct, prefillOrder } = useSite()
  const [main] = product.images
  const open = () => openProduct(product.id)

  return (
    <Card className="h-full gap-0 py-0">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={asset(main.src)}
          alt={main.alt}
          width={960}
          height={1440}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover/card:scale-[1.02]"
        />
        {product.badge ? (
          <Badge variant="secondary" className="absolute top-3 left-3">
            {product.badge}
          </Badge>
        ) : null}
        <Badge variant="outline" className="absolute bottom-3 left-3 bg-background/90">
          <Box />
          360° 3D
        </Badge>
        <button
          type="button"
          onClick={open}
          className="absolute inset-0 cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
        >
          <span className="sr-only">{product.name} 상세 사진·3D 보기</span>
        </button>
      </div>

      <CardHeader className="gap-2 pt-4">
        <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
          <span>No.{product.no}</span>
          <span>
            {product.category.ko} · {product.category.en}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <CardTitle lang="en" className="text-lg font-semibold tracking-tight">
            {product.name}
          </CardTitle>
          <p className="font-mono text-sm whitespace-nowrap tabular-nums">{formatPrice(product.price)}원</p>
        </div>
        <CardDescription>
          {product.nameKo} — {product.summary}
        </CardDescription>
        <p className="font-mono text-xs text-muted-foreground">{product.spec}</p>
      </CardHeader>

      <CardFooter className="mt-4 flex-wrap gap-2">
        <Button asChild size="sm">
          <a href={productLink(product.id)} target="_blank" rel="noopener noreferrer">
            구매하기 <ArrowUpRight data-icon="inline-end" />
            <span className="sr-only">: {product.name} (스마트스토어, 새 창)</span>
          </a>
        </Button>
        <Button variant="outline" size="sm" onClick={open}>
          상세·3D<span className="sr-only">: {product.name}</span>
        </Button>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={() => prefillOrder({ type: "group", productId: product.id })}>
          단체 문의<span className="sr-only">: {product.name}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function Collection() {
  return (
    <section id="collection" data-km="10" data-nav="collection" aria-labelledby="collection-title" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="collection-title"
          no="01"
          label="Collection"
          split="Split · 10.0 km"
          title="Gear for daily miles"
          titleKo="매일의 러닝을 위한 여섯 가지"
          lead="화려한 기능보다 오래 쓰는 기본기에 집중했어요. 출근 전 조깅부터 주말 장거리까지, 손이 먼저 가는 것들만 골랐어요."
        />
        <ul role="list" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product, i) => (
            <li key={product.id}>
              <Reveal delay={i % 3} className="h-full">
                <ProductCard product={product} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
