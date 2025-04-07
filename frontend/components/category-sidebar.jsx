"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"

export default function CategorySidebar() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category")

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
    <div className="w-full max-w-[250px] rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-4">Categories</h3>
        <ScrollArea className="h-[calc(100vh-250px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : categories.length > 0 ? (
            <div className="space-y-1">
              <Button
                variant={!currentCategory ? "secondary" : "ghost"}
                className="w-full justify-start font-normal"
                asChild
              >
                <Link href="/shop">All Products</Link>
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={currentCategory === category.name.toLowerCase().replace(/\s+/g, '-') ? "secondary" : "ghost"}
                  className="w-full justify-start font-normal group"
                  asChild
                >
                  <Link href={`/shop?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {category.name}
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No categories found
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}

