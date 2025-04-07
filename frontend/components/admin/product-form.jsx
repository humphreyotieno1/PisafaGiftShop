"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Minus, Plus, Trash2, Upload, AlertCircle, CheckCircle2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export default function ProductForm({ categories, product, onSuccess }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewImage, setPreviewImage] = useState(product?.image || '')
  const [activeTab, setActiveTab] = useState("basic")
  const [formErrors, setFormErrors] = useState({})
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    imageUrl: product?.imageUrl || '',
    imageData: product?.imageData || '',
    categoryId: product?.categoryId || '',
    features: product?.features || [''],
    specs: product?.specs || [{ name: '', value: '' }],
    stock: product?.stock?.toString() || '0',
    inStock: product?.inStock !== undefined ? product.inStock : (product?.stock > 0 || false),
    tags: product?.tags || []
  })

  // Set initial category when editing a product
  useEffect(() => {
    if (product && product.categoryName && categories.length > 0) {
      const category = categories.find(cat => cat.name === product.categoryName)
      if (category) {
        setFormData(prev => ({ ...prev, categoryId: category.id }))
      }
    }
  }, [product, categories])

  // Validate form on change
  useEffect(() => {
    validateForm()
  }, [formData])

  const validateForm = () => {
    const errors = {}
    
    // Required fields
    if (!formData.name.trim()) errors.name = 'Product name is required'
    if (!formData.description.trim()) errors.description = 'Description is required'
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      errors.price = 'Valid price is required'
    }
    if (!formData.categoryId) errors.categoryId = 'Category is required'
    
    // Optional fields with validation
    if (formData.stock && (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0)) {
      errors.stock = 'Stock must be a positive number'
    }
    
    // Validate features and specs
    const validFeatures = formData.features.filter(f => f.trim() !== '')
    const validSpecs = formData.specs.filter(s => s.name.trim() !== '' && s.value.trim() !== '')
    
    if (validFeatures.length === 0) {
      errors.features = 'At least one feature is required'
    }
    
    if (validSpecs.length === 0) {
      errors.specs = 'At least one specification is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
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
    
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      })
      return
    }
    
    setLoading(true)
    try {
      // Find the selected category
      const selectedCategory = categories.find(cat => cat.id === formData.categoryId)
      
      if (!selectedCategory) {
        throw new Error('Please select a valid category')
      }
      
      // Prepare the product data
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10) || 0,
        inStock: formData.inStock,
        categoryName: selectedCategory.name,
        features: formData.features
          .filter(f => f.trim() !== '')
          .map(f => f.trim()),
        specs: formData.specs
          .filter(s => s.name.trim() !== '' && s.value.trim() !== '')
          .map(spec => ({
            name: spec.name.trim(),
            value: spec.value.trim()
          })),
        tags: (formData.tags || []).map(tag => tag.trim()),
        image: formData.imageData || formData.imageUrl || null
      }

      // Log the data being sent to the API for debugging
      console.log('Sending product data:', JSON.stringify(productData, null, 2))

      const response = await fetch(`/api/admin/products${product ? `/${product.id}` : ''}`, {
        method: product ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save product')
      }

      toast({
        title: `Product ${product ? 'Updated' : 'Created'}`,
        description: `Product has been successfully ${product ? 'updated' : 'created'}.`,
      })
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/admin/products')
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleFeatureChange = (index, value) => {
    setFormData(prev => {
      const newFeatures = [...prev.features]
      newFeatures[index] = value
      return { ...prev, features: newFeatures }
    })
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleSpecChange = (index, field, value) => {
    setFormData(prev => {
      const newSpecs = [...prev.specs]
      newSpecs[index] = { ...newSpecs[index], [field]: value }
      return { ...prev, specs: newSpecs }
    })
  }

  const addSpec = () => {
    setFormData(prev => ({
      ...prev,
      specs: [...prev.specs, { name: '', value: '' }]
    }))
  }

  const removeSpec = (index) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index)
    }))
  }

  const handleCategoryChange = (categoryId) => {
    // Find the selected category
    const selectedCategory = categories.find(cat => cat.id === categoryId)
    
    if (selectedCategory) {
      console.log('Selected category:', selectedCategory.name)
      setFormData(prev => ({ ...prev, categoryId }))
    } else {
      console.error('Category not found:', categoryId)
      toast({
        title: "Error",
        description: "Selected category not found. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault()
      const newTag = e.target.value.trim()
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }))
      }
      e.target.value = ''
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const renderError = (field) => {
    if (formErrors[field]) {
      return (
        <div className="flex items-center text-red-500 text-sm mt-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          {formErrors[field]}
        </div>
      )
    }
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      <Card className="w-full shadow-md">
        <CardHeader className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b px-6 py-4">
          <CardTitle className="text-2xl font-bold">{product?.id ? 'Edit Product' : 'Add New Product'}</CardTitle>
          <CardDescription className="text-base mt-1">
            Fill in the details below to {product?.id ? 'update' : 'create'} a product.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[calc(100vh-12rem)] px-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-1 sm:grid-cols-3 mb-6 sticky top-0 z-10 bg-white dark:bg-gray-950 py-2 border-b">
              <TabsTrigger value="basic" className="text-base py-2">Basic Info</TabsTrigger>
              <TabsTrigger value="details" className="text-base py-2">Details</TabsTrigger>
              <TabsTrigger value="media" className="text-base py-2">Media</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className={`h-10 ${formErrors.name ? "border-red-500" : ""}`}
                  />
                  {renderError('name')}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-base font-medium">Category *</Label>
                  <Select 
                    value={formData.categoryId}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className={`h-10 ${formErrors.categoryId ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>No categories available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {renderError('categoryId')}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  className={`min-h-[150px] ${formErrors.description ? "border-red-500" : ""}`}
                />
                {renderError('description')}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base font-medium">Price (Ksh) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className={`h-10 ${formErrors.price ? "border-red-500" : ""}`}
                  />
                  {renderError('price')}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-base font-medium">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={`h-10 ${formErrors.stock ? "border-red-500" : ""}`}
                  />
                  {renderError('stock')}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, inStock: checked }))
                  }
                  className="h-5 w-5"
                />
                <Label htmlFor="inStock" className="text-base">Mark as In Stock</Label>
              </div>
              <p className="text-sm text-gray-500">
                Products with stock quantity of 0 will automatically be marked as out of stock. Use this checkbox to manually override the stock status.
              </p>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-8 pb-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <Label className="text-base font-medium">Product Features *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                    className="h-9"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                        className={`${index === 0 && formErrors.features ? "border-red-500" : ""} flex-1 h-10`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature(index)}
                        className="self-end sm:self-auto h-10 w-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {renderError('features')}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <Label className="text-base font-medium">Product Specifications *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSpec}
                    className="h-9"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Specification
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.specs.map((spec, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={spec.name}
                        onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                        placeholder="Spec name"
                        className={`${index === 0 && formErrors.specs ? "border-red-500" : ""} flex-1 h-10`}
                      />
                      <Input
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        placeholder="Spec value"
                        className={`${index === 0 && formErrors.specs ? "border-red-500" : ""} flex-1 h-10`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSpec(index)}
                        className="self-end sm:self-auto h-10 w-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {renderError('specs')}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <Label className="text-base font-medium">Product Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 border rounded-md">
                  {formData.tags.length > 0 ? (
                    formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1 px-2 text-sm">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No tags added yet</p>
                  )}
                </div>
                <Input
                  placeholder="Type a tag and press Enter"
                  onKeyDown={handleTagInput}
                  className="h-10"
                />
                <p className="text-sm text-gray-500">
                  Press Enter to add a tag. Tags help with product categorization and search.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-6 pb-6">
              <div>
                <Label className="text-base font-medium">Product Image</Label>
                <label
                  htmlFor="image-upload"
                  className={`block border-2 border-dashed rounded-lg p-6 text-center mt-2 ${
                    dragActive ? 'border-primary bg-primary/5' : 'border-gray-200'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Product preview" 
                        className="w-full h-64 object-contain"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.preventDefault() // Prevent label click
                          setPreviewImage('')
                          setFormData(prev => ({ ...prev, imageUrl: '', imageData: '' }))
                        }}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-16 w-16 text-gray-400" />
                      <p className="mt-3 text-base">
                        {loading ? 'Uploading...' : 'Drag & drop an image here, or click to select'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">PNG, JPG or WEBP (max. 1MB)</p>
                    </>
                  )}
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleImageUpload(e.target.files?.[0])}
                    className="hidden"
                    id="image-upload"
                    disabled={loading}
                  />
                </label>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="sticky bottom-0 z-10 bg-white dark:bg-gray-950 border-t flex flex-col sm:flex-row justify-between gap-4 py-4 px-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto h-10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || Object.keys(formErrors).length > 0}
              className="w-full sm:w-auto h-10"
            >
              {loading ? 'Saving...' : product?.id ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}
