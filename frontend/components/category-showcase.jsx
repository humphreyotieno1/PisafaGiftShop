"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function CategoryShowcase() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/shop/categories')
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
        setCategories(data.categories)
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: 'Error',
          description: 'Failed to load categories',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  return (
    <section className="mx-auto w-full max-w-7xl px-4">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
          <p className="text-muted-foreground">Browse our exquisite collection of jewelry by category</p>
        </div>
        <Link 
          href="/shop" 
          className="text-sm font-medium hover:text-primary flex items-center gap-1 transition-colors"
        >
          View all categories <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="h-64 animate-pulse rounded-lg bg-muted"
            />
          ))
        ) : categories.length > 0 ? (
          categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group relative overflow-hidden rounded-lg border bg-card"
            >
              <Link href={`/shop?category=${category.slug}`} className="block h-full">
                <div className="relative h-64 w-full overflow-hidden">
                  {category.image ? (
                    <motion.img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <span className="text-4xl font-bold text-muted-foreground">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <motion.h3 
                    className="text-xl font-bold"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {category.name}
                  </motion.h3>
                  <motion.p 
                    className="text-sm text-white/80"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {category.productCount} products
                  </motion.p>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground">
            No categories found
          </div>
        )}
      </div>
    </section>
  )
}

