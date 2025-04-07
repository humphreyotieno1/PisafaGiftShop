"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Filter, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import ProductCard from "@/components/product-card"
import CategorySidebar from "@/components/category-sidebar"
import Pagination from "@/components/pagination"
import { useToast } from "@/components/ui/use-toast"

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  )
}

function ShopContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 8,
    pages: 1
  })

  const currentPage = parseInt(searchParams.get("page")) || 1
  const selectedCategory = searchParams.get("category")

  // Fetch products when dependencies change
  useEffect(() => {
    fetchProducts()
  }, [currentPage, selectedCategory, sortBy, searchQuery])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: pagination.limit,
        sort: sortBy === 'featured' ? 'createdAt' : sortBy.split('-')[0],
        order: sortBy.includes('desc') ? 'desc' : 'asc'
      })
      
      if (selectedCategory) {
        params.append('category', selectedCategory)
      }
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/shop/products?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      
      const data = await response.json()
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchQuery(value)
  }

  const handleSortChange = (value) => {
    setSortBy(value)
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 md:pt-32">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Category Sidebar */}
        <div className="hidden md:block w-64">
          <CategorySidebar />
        </div>

        {/* Mobile Filter Button and Search */}
        <div className="md:hidden">
          <div className="flex items-center gap-4 mb-4">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="py-4">
                  <CategorySidebar />
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Desktop Search and Sort */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <div className="w-72">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg h-[300px]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-lg font-medium text-muted-foreground mb-4">
                {searchQuery
                  ? "No products found matching your search"
                  : selectedCategory
                  ? "No products found in this category"
                  : "No products found"}
              </p>
              {(searchQuery || selectedCategory) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    window.history.pushState({}, "", "/shop")
                  }}
                >
                  View All Products
                </Button>
              )}
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
              
              {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.pages}
                    onPageChange={(page) => {
                      const params = new URLSearchParams(window.location.search)
                      params.set("page", page)
                      window.history.pushState({}, "", `?${params.toString()}`)
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

