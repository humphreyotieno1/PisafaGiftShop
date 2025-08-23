"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import ProductCard from "@/components/product-card"
import CategorySidebar from "@/components/category-sidebar"
import Pagination from "@/components/pagination"
import { useToast } from "@/components/ui/use-toast"
import { shopApi } from "@/lib/api"
import type { Product } from "@/types/api"

export default function ShopContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 8, pages: 1 })

  const currentPage = parseInt(searchParams.get("page") || "1") || 1
  const selectedCategory = searchParams.get("category")

  useEffect(() => { fetchProducts() }, [currentPage, selectedCategory, sortBy, searchQuery])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const all = await shopApi.getProducts()
      let filtered = all
      if (selectedCategory) {
        const catId = Number(selectedCategory)
        filtered = filtered.filter(p => p.category_id === catId)
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      }
      if (sortBy.startsWith('price')) {
        filtered = filtered.slice().sort((a,b) => sortBy.endsWith('asc') ? a.price - b.price : b.price - a.price)
      } else if (sortBy.startsWith('name')) {
        filtered = filtered.slice().sort((a,b) => sortBy.endsWith('asc') ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))
      }
      setProducts(filtered)
      setPagination(prev => ({ ...prev, total: filtered.length, pages: Math.max(1, Math.ceil(filtered.length / prev.limit)) }))
    } catch (error) {
      console.error('Error fetching products:', error)
      toast({ title: 'Error', description: 'Failed to load products. Please try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)
  const handleSortChange = (value: string) => setSortBy(value)

  return (
    <div className="container mx-auto px-4 py-8 pt-24 md:pt-32">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="hidden md:block w-64">
          <CategorySidebar selectedCategory={selectedCategory ? Number(selectedCategory) : null} onCategoryChange={(id) => {
            const params = new URLSearchParams(searchParams.toString())
            if (id === null) params.delete('category'); else params.set('category', String(id))
            router.replace(`?${params.toString()}`, { scroll: false })
          }} />
        </div>

        <div className="md:hidden">
          <div className="flex items-center gap-4 mb-4">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]" title="Filters">
                <div className="py-4">
                  <CategorySidebar selectedCategory={selectedCategory ? Number(selectedCategory) : null} onCategoryChange={(id) => {
                    const params = new URLSearchParams(searchParams.toString())
                    if (id === null) params.delete('category'); else params.set('category', String(id))
                    router.replace(`?${params.toString()}`, { scroll: false })
                    setIsFilterOpen(false)
                  }} />
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex-1">
              <Input type="search" placeholder="Search products..." value={searchQuery} onChange={handleSearch} className="w-full" />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="hidden md:flex items-center justify-between mb-6">
            <div className="w-72">
              <Input type="search" placeholder="Search products..." value={searchQuery} onChange={handleSearch} />
            </div>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="bg-muted rounded-lg h-[300px]" />))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-lg font-medium text-muted-foreground mb-4">
                {searchQuery ? "No products found matching your search" : selectedCategory ? "No products found in this category" : "No products found"}
              </p>
              {(searchQuery || selectedCategory) && (
                <Button variant="outline" onClick={() => { setSearchQuery(""); router.push("/shop") }}>View All Products</Button>
              )}
            </div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (<ProductCard key={product.id} product={product} />))}
              </motion.div>
              {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination currentPage={currentPage} totalPages={pagination.pages} onPageChange={(page: number) => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set("page", String(page))
                    router.replace(`?${params.toString()}`, { scroll: false })
                  }} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}


