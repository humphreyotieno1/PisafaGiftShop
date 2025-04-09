"use client"

import { useState, useEffect, useCallback, memo } from "react"
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
import { useOptimizedFetch, useOptimizedMutation } from "@/hooks/useOptimizedFetch"
import { compressImage, validateImage } from "@/lib/image-optimizer"

// Helper function to format error messages
const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  return 'An unexpected error occurred'
}

// Memoized category table row component to prevent unnecessary re-renders
const CategoryRow = memo(({ category, onEdit, onDelete }) => (
  <motion.tr 
    key={category.id} 
    className="border-t hover:bg-muted/30 transition-colors"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <td className="px-4 py-3">
      {category.image ? (
        <img
          src={category.image}
          alt={category.name}
          className="h-10 w-10 object-cover rounded-md border"
          loading="lazy"
        />
      ) : (
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </td>
    <td className="px-4 py-3 font-medium">{category.name}</td>
    <td className="px-4 py-3">
      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
        {category.productCount}
      </span>
    </td>
    <td className="px-4 py-3 text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => onEdit(category)} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(category)}
            className="text-destructive cursor-pointer focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </td>
  </motion.tr>
));

CategoryRow.displayName = 'CategoryRow';

export default function CategoriesPage() {
  const { toast } = useToast()
  const { user, isAdmin, navigateBack } = useAuth()
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

  // Use optimized fetch hook for categories
  const { 
    data: categoriesData, 
    loading, 
    error: fetchError, 
    refetch: fetchCategories 
  } = useOptimizedFetch('/api/admin/categories')

  // Use optimized mutation hooks for CRUD operations
  const { 
    mutate: createCategory, 
    loading: createLoading, 
    error: createError 
  } = useOptimizedMutation('/api/admin/categories', 'POST')

  const { 
    mutate: updateCategory, 
    loading: updateLoading, 
    error: updateError 
  } = useOptimizedMutation('/api/admin/categories', 'PUT')

  const { 
    mutate: deleteCategory, 
    loading: deleteLoading, 
    error: deleteError 
  } = useOptimizedMutation('/api/admin/categories', 'DELETE')

  // Compute actionLoading state
  const actionLoading = createLoading || updateLoading || deleteLoading

  // Get categories from data
  const categories = categoriesData?.categories || []

  useEffect(() => {
    if (user && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You don\'t have permission to access this page.',
        variant: 'destructive',
      })
      navigateBack('/')
    }
  }, [user, isAdmin, navigateBack, toast])

  // Handle errors from fetch and mutations
  useEffect(() => {
    const error = fetchError || createError || updateError || deleteError
    if (error) {
      toast({
        title: 'Error',
        description: formatErrorMessage(error),
        variant: 'destructive',
      })
    }
  }, [fetchError, createError, updateError, deleteError, toast])

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

  const handleImageUpload = useCallback(async (file) => {
    try {
      // Validate image
      const validation = validateImage(file, ['image/jpeg', 'image/png', 'image/webp'], 1)
      if (!validation.valid) {
        toast({
          title: "Error",
          description: validation.error,
          variant: "destructive",
        })
        return
      }

      // Compress image
      const base64Data = await compressImage(file, 800, 800, 0.8)
      
      setFormData(prev => ({
        ...prev,
        imageData: base64Data,
        imageUrl: URL.createObjectURL(file)
      }))
      setPreviewImage(URL.createObjectURL(file))
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: formatErrorMessage(error),
        variant: "destructive",
      })
    }
  }, [toast])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    try {
      // Prepare the request body
      const requestBody = {
        name: formData.name,
        image: formData.imageData
      }
      
      if (editingCategory) {
        // Update existing category
        await updateCategory(requestBody, `/api/admin/categories/${editingCategory.id}`)
      } else {
        // Create new category
        await createCategory(requestBody)
      }
      
      // Refresh categories list
      await fetchCategories()
      
      // Reset form state
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
      // Error is handled by the useEffect above
    }
  }, [editingCategory, formData, createCategory, updateCategory, fetchCategories, toast])

  const handleDelete = useCallback((category) => {
    setCategoryToDelete(category.id)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await deleteCategory(null, `/api/admin/categories/${categoryToDelete}`)
      
      // Refresh categories list
      await fetchCategories()
      
      toast({
        title: 'Category Deleted',
        description: 'The category has been successfully deleted.',
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      // Error is handled by the useEffect above
    } finally {
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }, [categoryToDelete, deleteCategory, fetchCategories, toast])

  const handleAddCategory = useCallback(() => {
    setEditingCategory(null)
    setFormData({
      name: '',
      imageData: null,
      imageUrl: ''
    })
    setPreviewImage('')
    setIsDialogOpen(true)
  }, [])

  const handleEdit = useCallback((category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      imageData: category.image || null,
      imageUrl: category.image || ''
    })
    setPreviewImage(category.image || '')
    setIsDialogOpen(true)
  }, [])

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    // Search is handled by the filteredCategories computation
  }, [])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage product categories</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={navigateBack} size="sm" className="h-9">
            Back
          </Button>
          <Button 
            onClick={handleAddCategory} 
            size="sm" 
            className="h-9 flex items-center gap-2 bg-primary hover:bg-primary/90"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Category
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
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
                  className="pl-10 w-full max-w-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
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
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Image</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Products</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
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
                      <CategoryRow 
                        key={category.id}
                        category={category}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !actionLoading && setIsDialogOpen(open)}>
        <DialogContent className="sm:max-w-md">
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
                className="w-full"
                disabled={actionLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Category Image</Label>
              <div
                className={`relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
                } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDragEnter={!actionLoading ? handleDrag : undefined}
                onDragLeave={!actionLoading ? handleDrag : undefined}
                onDragOver={!actionLoading ? handleDrag : undefined}
                onDrop={!actionLoading ? handleDrop : undefined}
                onClick={() => !actionLoading && document.getElementById('image-upload')?.click()}
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
                  disabled={actionLoading}
                />
                {previewImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-lg"
                      loading="lazy"
                    />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage('');
                        setFormData(prev => ({ ...prev, imageData: null, imageUrl: '' }));
                      }}
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
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
            <DialogFooter className="sm:justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>{editingCategory ? 'Update' : 'Create'} Category</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => !actionLoading && setIsDeleteDialogOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
              {categoryToDelete && (
                <p className="mt-2 font-medium text-red-600">
                  Category: {categories.find(c => c.id === categoryToDelete)?.name || categoryToDelete}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setCategoryToDelete(null)
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  <span>Deleting...</span>
                </div>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}