"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, MoreHorizontal, Search, Loader2 } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAuthContext } from "@/contexts/AuthContext"
import ProductForm from "@/components/admin/product-form"
import { adminApi } from "@/lib/api"
import type { Product, Category } from "@/types/api"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

// Helper function to format error messages
const formatErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  try { return JSON.stringify(error) } catch { return 'An unexpected error occurred' }
}

export default function ProductsPage() {
  const { toast } = useToast()
  const { user } = useAuthContext()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    fetchProducts()
    fetchCategories()
  }, [user])

  // Handle category filter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const categoryId = urlParams.get('category')
    if (categoryId) {
      setSelectedCategory(parseInt(categoryId))
    }
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast({ title: 'Error', description: formatErrorMessage(error), variant: 'destructive' })
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await adminApi.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({ title: 'Error', description: formatErrorMessage(error), variant: 'destructive' })
    }
  }

  const handleDelete = async (productId: number) => {
    try {
      await adminApi.deleteProduct(productId)
      await fetchProducts()
      toast({ title: 'Product deleted' })
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({ title: 'Error deleting product', description: formatErrorMessage(error), variant: 'destructive' })
    }
  }

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === null || p.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => { setEditingProduct(null); setIsDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" /> New Product
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={selectedCategory?.toString() || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? null : parseInt(value))}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            Manage your catalog
            {selectedCategory && (
              <span className="block text-sm text-muted-foreground mt-1">
                Filtered by category: {categories.find(c => c.id === selectedCategory)?.name}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-40 rounded-md bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">No products found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <div key={p.id} className="rounded-lg border p-4 space-y-3">
                  <div className="font-medium line-clamp-1">{p.name}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">{p.description}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Ksh {p.price.toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" onClick={() => { setEditingProduct(p); setIsDialogOpen(true) }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setConfirmDeleteId(p.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'New Product'}</DialogTitle>
            <DialogDescription>Fill the form to {editingProduct ? 'update' : 'create'} a product</DialogDescription>
          </DialogHeader>
          <ProductForm 
            product={editingProduct || undefined} 
            mode={editingProduct ? 'edit' : 'create'} 
            onSuccess={() => {
              setIsDialogOpen(false);
              fetchProducts();
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (confirmDeleteId) handleDelete(confirmDeleteId); setConfirmDeleteId(null) }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
