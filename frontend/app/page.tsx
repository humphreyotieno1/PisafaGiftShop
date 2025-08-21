import Link from "next/link"
import { Button } from "@/components/ui/button"
import HeroSection from "@/components/hero-section"
import FeaturedProducts from "@/components/featured-products"
import CategoryShowcase from "@/components/category-showcase"

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <HeroSection />
      <FeaturedProducts />
      <CategoryShowcase />

      <section className="mx-auto w-full max-w-7xl px-4 text-center">
        <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
          Ready to find the perfect gift for your loved ones?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
          Browse our extensive catalog of high-quality gift items for all occasions. We offer competitive prices
          and fast shipping.
        </p>
        <Button asChild size="lg" className="px-8">
          <Link href="/shop">Shop Now</Link>
        </Button>
      </section>
    </div>
  )
}
