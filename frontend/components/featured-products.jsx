"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"

// Sample featured products data - in a real app, this would come from an API
export const featuredProducts = [
  {
    id: "diamond-ring-elegance",
    name: "Diamond Elegance Ring",
    price: 1499,
    image: "/featured/ring1.jpg",
    category: "Rings",
    rating: 4.8,
    description: "A stunning diamond ring featuring a brilliant cut center stone surrounded by delicate pavé diamonds. Perfect for engagements or special occasions.",
    features: [
      "18K white gold setting",
      "0.5 carat center diamond",
      "Pavé diamond band",
    ],
    inStock: true,
    specs: {
      material: "18K White Gold",
      stone: "Diamond",
      size: "Available in sizes 4-9",
    }
  },
  {
    id: "pearl-necklace-classic",
    name: "Classic Pearl Necklace",
    price: 3499,
    image: "/featured/necklace1.jpg",
    category: "Necklaces",
    rating: 4.6,
    description: "Timeless elegance with this classic pearl necklace featuring perfectly matched freshwater pearls. A versatile piece for any occasion.",
    features: [
      "Freshwater pearls",
      "14K gold clasp",
      "Adjustable length",
    ],
    inStock: true,
    specs: {
      pearls: "Freshwater",
      length: "16-18 inches",
      clasp: "14K Gold",
    }
  },
  {
    id: "sapphire-earrings-set",
    name: "Sapphire Stud Earrings",
    price: 999,
    image: "/featured/earrings1.jpg",
    category: "Earrings",
    rating: 4.9,
    description: "Exquisite sapphire stud earrings set in 18K gold. These timeless pieces add a touch of sophistication to any outfit.",
    features: [
      "Natural blue sapphires",
      "18K gold setting",
      "Secure screw-back design",
    ],
    inStock: true,
    specs: {
      stone: "Natural Sapphire",
      setting: "18K Gold",
      weight: "0.75 carats total",
    }
  },
  {
    id: "gold-bracelet-stack",
    name: "Gold Bangle Stack",
    price: 1999,
    image: "/featured/bracelet1.jpg",
    category: "Bracelets",
    rating: 4.7,
    description: "A set of three elegant gold bangles that can be worn together or separately. Each piece features a unique texture and design.",
    features: [
      "18K yellow gold",
      "Three-piece set",
      "Adjustable fit",
    ],
    inStock: true,
    specs: {
      material: "18K Yellow Gold",
      width: "5mm each",
      set: "3 pieces",
    }
  },
]

export default function FeaturedProducts() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12">
      <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Featured Collections</h2>
          <p className="mt-2 text-lg text-muted-foreground">Discover our most exquisite jewelry pieces</p>
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

