"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"

// Sample featured products data - in a real app, this would come from an API
const featuredProducts = [
  {
    id: "brake-pads-premium",
    name: "Premium Ceramic Brake Pads",
    price: 12499,
    image: "/featured/pad.jpeg",
    category: "Brakes",
    rating: 4.8,
    description: "Experience unmatched stopping power with our premium ceramic brake pads. Engineered for both daily drivers and performance enthusiasts, these pads deliver exceptional braking with minimal noise and dust.",
    features: [
      "Advanced ceramic compound for whisper-quiet braking",
      "Precision-cut chamfers prevent brake squeal",
      "Premium shims for maximum noise reduction",
    ],
    inStock: true,
    specs: {
      material: "Ceramic Composite",
      position: "Front & Rear Available",
      warranty: "Limited Lifetime",
    }
  },
  {
    id: "oil-filter-pro",
    name: "Pro-Series Oil Filter Elite",
    price: 3499,
    image: "/featured/filter.jpeg",
    category: "Engine",
    rating: 4.6,
    description: "Protect your engine with our elite oil filter featuring advanced synthetic media. Designed for extended service intervals, it captures 99.9% of harmful contaminants while maintaining optimal oil flow.",
    features: [
      "Multi-stage filtration with synthetic media",
      "Heavy-duty anti-drainback valve",
      "High-capacity debris retention",
    ],
    inStock: true,
    specs: {
      filterMedia: "Synthetic Blend",
      threadSize: "3/4-16 UNF",
      capacity: "15,000 miles",
    }
  },
  {
    id: "led-headlight-kit",
    name: "Ultra Vision Pro LED System",
    price: 18999,
    image: "/featured/LED.jpeg",
    category: "Lighting",
    rating: 4.9,
    description: "Transform your night driving experience with our cutting-edge LED headlight system. Featuring advanced cooling technology and simple plug-and-play installation, these lights deliver unmatched brightness and clarity.",
    features: [
      "Crystal-clear 6000K pure white output",
      "Advanced heat dissipation design",
      "Waterproof and dustproof housing",
    ],
    inStock: true,
    specs: {
      brightness: "12,000 lumens/pair",
      temperature: "6000K Pure White",
      lifespan: "50,000+ hours",
    }
  },
  {
    id: "alloy-wheel-set",
    name: "Forged Performance Wheel Set",
    price: 84999,
    image: "/featured/wheel.jpeg",
    category: "Wheels",
    rating: 4.7,
    description: "Elevate your vehicle's performance and style with our lightweight forged alloy wheels. Each wheel is precision-engineered using advanced flow-forming technology, offering the perfect balance of strength and weight reduction.",
    features: [
      "Premium 6061-T6 aluminum construction",
      "Exclusive dual-tone finish",
      "Advanced flow-forming technology",
    ],
    inStock: true,
    specs: {
      size: "18\", 19\", 20\" available",
      weight: "17.8 lbs per wheel",
      finish: "Gloss Black/Machined",
    }
  },
]

export default function FeaturedProducts() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12">
      <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Featured Products</h2>
          <p className="mt-2 text-lg text-muted-foreground">Discover our most popular auto parts and accessories</p>
        </div>
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link href="/shop" className="gap-2">
            View All Products
            <span aria-hidden="true">→</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              ease: [0.25, 0.1, 0.25, 1], // Smooth easing function
            }}
            className="h-full"
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

