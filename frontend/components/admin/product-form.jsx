"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Minus, Plus, Trash2, Upload } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function ProductForm({ categories, product, onSuccess }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewImage, setPreviewImage] = useState(product?.image || '')
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    imageUrl: product?.imageUrl || '',
    imageData: product?.imageData || '',
    categoryId: product?.categoryId || '',
    features: product?.features || [''],
    specs: product?.specs || [{ name: '', value: '' }],
    stock: product?.stock?.toString() || '',
    inStock: product?.stock > 0 || false
  })

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

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size too large. Maximum size is 2MB.",
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
    setLoading(true)

    try {
      const url = product?.id
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'
      
      const method = product?.id ? 'PUT' : 'POST'

      // Prepare the data
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl,
        imageData: formData.imageData,
        categoryId: formData.categoryId,
        stock: parseInt(formData.stock),
        features: formData.features.filter(f => f.trim() !== ''),
        specs: formData.specs.reduce((acc, spec) => {
          if (spec.name && spec.value) {
            acc[spec.name] = spec.value
          }
          return acc
        }, {})
      }
          
        const response = await fetch(url, {
        method,
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(productData),
        })

        if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${product?.id ? 'update' : 'create'} product`)
        }

        toast({
        title: `Product ${product?.id ? 'Updated' : 'Created'}`,
        description: `Product has been successfully ${product?.id ? 'updated' : 'created'}.`,
      })
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/admin/products')
        router.refresh()
      }
    } catch (error) {
      console.error('Error submitting product:', error)
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
    setFormData(prev => ({ ...prev, categoryId }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (Ksh)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
                <Select 
                value={formData.categoryId}
                onValueChange={handleCategoryChange}
                required
                >
                <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                  {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </div>

          <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
              value={formData.stock}
              onChange={handleInputChange}
              required
            />
            </div>

            <div className="flex items-center space-x-2">
            <Checkbox
                id="inStock"
              checked={formData.inStock}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, inStock: checked }))
              }
            />
            <Label htmlFor="inStock">Mark as In Stock</Label>
          </div>
          <p className="text-sm text-gray-500">
            Products with stock quantity of 0 will automatically be marked as out of stock. Use this checkbox to manually override the stock status.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Product Image</Label>
            <label
              htmlFor="image-upload"
              className={`block border-2 border-dashed rounded-lg p-4 text-center ${
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
                    className="w-full h-48 object-contain"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
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
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">
                    {loading ? 'Uploading...' : 'Drag & drop an image here, or click to select'}
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG or WEBP (max. 2MB)</p>
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

          <div>
            <Label>Product Features</Label>
                <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                    onClick={() => removeFeature(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                className="w-full"
                onClick={addFeature}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
          </div>

          <div>
            <Label>Product Specifications</Label>
                <div className="space-y-2">
              {formData.specs.map((spec, index) => (
                <div key={index} className="flex gap-2">
                      <Input
                    value={spec.name}
                    onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                        placeholder="Spec name"
                      />
                      <Input
                        value={spec.value}
                    onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        placeholder="Spec value"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                    onClick={() => removeSpec(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                className="w-full"
                onClick={addSpec}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Specification
                  </Button>
                </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : product?.id ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
