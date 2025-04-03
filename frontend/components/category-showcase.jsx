"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"

// Sample category data
const categories = [
  {
    id: 1,
    name: "Engine Parts",
    image: "/featured/engine.jpeg?height=400&width=400",
    count: 120,
    slug: "engine-parts",
  },
  {
    id: 2,
    name: "Body Parts",
    image: "/featured/body.jpeg?height=400&width=400",
    count: 85,
    slug: "body-parts",
  },
  {
    id: 3,
    name: "Electrical",
    image: "/featured/electrical.jpeg?height=400&width=400",
    count: 95,
    slug: "electrical",
  },
  {
    id: 4,
    name: "Wheels & Tires",
    image: "/featured/tires.jpeg?height=400&width=400",
    count: 65,
    slug: "wheels-tires",
  },
  {
    id: 5,
    name: "Frame",
    image: "/featured/frame.jpeg?height=400&width=400",
    count: 110,
    slug: "frame",
  },
]

export default function CategoryShowcase() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
          <p className="text-muted-foreground">Browse our extensive collection of parts by category</p>
        </div>
        <Link 
          href="/shop" 
          className="text-sm font-medium hover:text-primary flex items-center gap-1 transition-colors"
        >
          View all categories <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link
              href={`/shop?category=${category.slug}`}
              className="group relative block h-64 overflow-hidden rounded-lg bg-muted/50"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="mb-2 text-xl font-bold text-white group-hover:text-primary-foreground transition-colors">{category.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/90">{category.count} products</span>
                  <span className="flex items-center text-sm font-medium text-white/90 group-hover:text-white">
                    Browse Category
                    <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

