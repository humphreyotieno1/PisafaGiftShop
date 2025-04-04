"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import ProductCard from "@/components/product-card"
import CategorySidebar from "@/components/category-sidebar"
import Pagination from "@/components/pagination"
import { generateProducts } from "@/lib/dummy-data"
import { ProductList } from '@/components/shop/product-list'
import { SearchBar } from '@/components/shop/search-bar'
import { CategoryFilter } from '@/components/shop/category-filter'

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  )
}

function ShopContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get("subcategory") || "")

  const productsPerPage = 12

  useEffect(() => {
    // In a real app, this would be an API call
    const dummyProducts = generateProducts(100)
    setProducts(dummyProducts)
    setFilteredProducts(dummyProducts)
    setLoading(false)
  }, [])

  useEffect(() => {
    let result = [...products]

    // Apply category filter
    if (selectedCategory) {
      result = result.filter(
        (product) => product.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Apply subcategory filter if exists
    if (selectedSubcategory) {
      result = result.filter(
        (product) => product.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase()
      )
    }

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      default:
        // Featured - no specific sorting
        break
    }

    setFilteredProducts(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, sortBy, products, selectedCategory, selectedSubcategory])

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is already handled by the useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <SearchBar />
        <CategoryFilter />
      </div>
      <Suspense fallback={<div>Loading products...</div>}>
        <ProductList />
      </Suspense>
    </div>
  )
}

