"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  Check,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { generateProducts } from "@/lib/dummy-data"
import { useAuth } from "@/context/auth-context"

export default function ProductsPage() {
  const { toast } = useToast()
  const { user, isAdmin, navigateBack } = useAuth()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products')
        
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        setProducts(data.products)
        setFilteredProducts(data.products)
      } catch (error) {
        console.error('Error fetching products:', error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    // Filter products based on search query and category filter
    let result = [...products]

    if (searchQuery) {
      result = result.filter(
        product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (categoryFilter && categoryFilter !== "all") {
      result = result.filter(product => {
        if (categoryFilter === "uncategorized") {
          return !product.category
        }
        return product.category?.id === categoryFilter
      })
    }

    setFilteredProducts(result)
  }, [searchQuery, categoryFilter, products])

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is already handled by the useEffect
  }

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete product')
      }
      
      // Update local state
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId))
      setFilteredProducts(prevFiltered => prevFiltered.filter(product => product.id !== productId))
      
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      })
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStock = async (productId) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const newStatus = !product.inStock
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          inStock: newStatus,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update product')
      }
      
      // Update local state
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId
            ? { ...p, inStock: newStatus }
            : p
        )
      )
      setFilteredProducts(prevFiltered =>
        prevFiltered.map(p =>
          p.id === productId
            ? { ...p, inStock: newStatus }
            : p
        )
      )
      
      toast({
        title: newStatus ? "Product in stock" : "Product out of stock",
        description: `The product is now ${newStatus ? "in stock" : "out of stock"}.`,
      })
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get unique categories for the filter
  const categories = products
    .filter(product => product.category)
    .reduce((acc, product) => {
      if (!acc.some(cat => cat.id === product.category.id)) {
        acc.push({
          id: product.category.id,
          name: product.category.name
        })
      }
      return acc
    }, [])
    .sort((a, b) => a.name.localeCompare(b.name))

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      })
      navigateBack('/')
    }
  }, [user, isAdmin])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={navigateBack}>
            Back
          </Button>
          <Button asChild>
            <Link href="/admin/products/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>You have {filteredProducts.length} products in your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Product</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Category</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Price</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Stock</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Status</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                    {loading ? (
                      [...Array(5)].map((_, index) => (
                        <tr key={index} className="border-t">
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
                              <div className="space-y-2">
                                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                                <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                          </td>
                        </tr>
                      ))
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <p className="text-lg font-medium">No products found</p>
                            <p className="text-sm text-muted-foreground">
                              {searchQuery || categoryFilter !== "all" ? "Try adjusting your filters" : "Start by adding some products"}
                            </p>
                            {!searchQuery && categoryFilter === "all" && (
                              <Button asChild className="mt-4">
                                <Link href="/admin/products/new">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Product
                                </Link>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <motion.tr
                          key={product.id}
                          className="border-t"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image || "/products/default-product.svg"}
                                alt={product.name}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {product.category ? product.category.name : 'Uncategorized'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="font-medium">Ksh {product.price.toLocaleString()}</div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {product.stock}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${product.inStock ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"}`}
                            >
                              {product.inStock ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  In Stock
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3" />
                                  Out of Stock
                                </>
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/shop/${product.slug}`} className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleToggleStock(product.id)}
                                  className="flex items-center gap-2"
                                >
                                  {product.inStock ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                  {product.inStock ? "Mark as Out of Stock" : "Mark as In Stock"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(product.id)}
                                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
