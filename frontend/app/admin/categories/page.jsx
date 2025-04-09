"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, MoreHorizontal, Search, Image as ImageIcon, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"

// Helper function to format error messages
const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  return 'An unexpected error occurred'
}

export default function CategoriesPage() {
  const { toast } = useToast()
  const { user, isAdmin, navigateBack } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    imageData: null,
    imageUrl: ''
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  useEffect(() => {
    if (user && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You don\'t have permission to access this page.',
        variant: 'destructive',
      })
      navigateBack('/')
    } else {
      fetchCategories()
    }
  }, [user, isAdmin])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categories')
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
      setCategories(data.categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: 'Error',
        description: formatErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer?.files?.[0]
    if (file) {
      await handleImageUpload(file)
    }
  }, [])

  const handleImageUpload = async (file) => {
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Invalid file type. Only JPG, PNG, and WEBP files are allowed.",
          variant: "destructive",
        })
        return
      }

      // Validate file size (1MB)
      if (file.size > 1 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size too large. Maximum size is 1MB.",
          variant: "destructive",
        })
        return
      }

      // Convert file to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64Data = reader.result
        setFormData(prev => ({
          ...prev,
          imageData: base64Data,
          imageUrl: null // Clear the URL if we're using base64 data
        }))
        setPreviewImage(base64Data)
        toast({
          title: "Success",
          description: "Image uploaded successfully!",
        })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error handling image:", error)
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          image: formData.imageData // Send the base64 image data directly
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${editingCategory ? 'update' : 'create'} category`)
      }
      
      await fetchCategories()
      setIsDialogOpen(false)
      setFormData({ name: '', imageData: null, imageUrl: '' })
      setPreviewImage('')
      setEditingCategory(null)
      
      toast({
        title: `Category ${editingCategory ? 'Updated' : 'Created'}`,
        description: `Category has been successfully ${editingCategory ? 'updated' : 'created'}.`,
      })
    } catch (error) {
      console.error('Error submitting category:', error)
      toast({
        title: 'Error',
        description: formatErrorMessage(error),
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (categoryId) => {
    setCategoryToDelete(categoryId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryToDelete}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete category')
      }
      
      await fetchCategories()
      toast({
        title: 'Category Deleted',
        description: 'The category has been successfully deleted.',
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: 'Error',
        description: formatErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      imageData: null,
      imageUrl: ''
    })
    setPreviewImage('')
    setIsDialogOpen(true)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      imageData: category.image || null,
      imageUrl: ''
    })
    setPreviewImage(category.image || '')
    setIsDialogOpen(true)
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is handled by the filteredCategories computation
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage product categories</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={navigateBack}>
            Back
          </Button>
          <Button onClick={handleAddCategory} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>You have {filteredCategories.length} categories</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Categories Table */}
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Image</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Name</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Products</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, index) => (
                      <tr key={index} className="border-t">
                        <td colSpan={4} className="px-4 py-3">
                          <div className="h-12 animate-pulse rounded-md bg-muted" />
                        </td>
                      </tr>
                    ))
                  ) : filteredCategories.length === 0 ? (
                    <tr className="border-t">
                      <td colSpan={4} className="px-4 py-3 text-center text-muted-foreground">
                        No categories found
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category) => (
                      <tr key={category.id} className="border-t">
                        <td className="px-4 py-3">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="h-10 w-10 object-cover rounded-md"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">{category.name}</td>
                        <td className="px-4 py-3">{category.productCount}</td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(category)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(category.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update the category details' : 'Create a new category'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Category Image</Label>
              <div
                className={`relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                />
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or WEBP (max. 1MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
              {categoryToDelete && (
                <p className="mt-2 font-medium text-red-600">
                  Category: {categoryToDelete}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setCategoryToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}