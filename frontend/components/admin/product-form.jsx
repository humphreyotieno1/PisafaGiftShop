"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDropzone } from "react-dropzone"
import { X, Upload, Plus, Minus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

// Define the validation schema for the product form
const productSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.coerce.number().positive({ message: "Price must be a positive number" }),
  categoryId: z.string().min(1, { message: "Please select a category" }),
  inStock: z.boolean().default(true),
  features: z.array(z.string()).optional().default([]),
})

export default function ProductForm({ product, categories }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(product?.image || "") 
  const [features, setFeatures] = useState(product?.features || [""])
  const [specs, setSpecs] = useState(product?.specs ? Object.entries(product.specs).map(([key, value]) => ({ key, value })) : [{ key: "", value: "" }])

  // Initialize form with product data if editing, or empty values if creating
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || "",
      categoryId: product?.categoryId || "",
      inStock: product?.inStock !== undefined ? product.inStock : true,
      features: product?.features || [""],
    },
  })

  // Set up dropzone for image upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      toast({
        title: "Image selected",
        description: "Image will be uploaded when you save the product."
      })
    },
    onDropRejected: fileRejections => {
      const error = fileRejections[0]?.errors[0]
      toast({
        title: "Error",
        description: error?.message || "Failed to upload image. Please try again.",
        variant: "destructive"
      })
    }
  })

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true)

    try {
      // Prepare the product data
      const productData = {
        ...data,
        features: features.filter(feature => feature.trim() !== ""),
        specs: Object.fromEntries(specs.filter(spec => spec.key.trim() !== "" && spec.value.trim() !== "").map(spec => [spec.key, spec.value])),
      }

      try {
        // Upload image if provided
        let imageUrl = product?.image || ""
        if (imageFile) {
          const formData = new FormData()
          formData.append('file', imageFile)
          
          setLoading(true)
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          setLoading(false)
          
          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image')
          }
          
          const { url } = await uploadResponse.json()
          imageUrl = url
        }

        // Create or update product
        const url = product 
          ? `/api/admin/products/${product.id}`
          : '/api/admin/products'
          
        const response = await fetch(url, {
          method: product ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...productData,
            image: imageUrl,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to save product')
        }

        toast({
          title: product ? "Product updated" : "Product created",
          description: product ? "The product has been updated successfully." : "The product has been created successfully.",
        })

        // Redirect to the products page
        router.push("/admin/products")
      } catch (error) {
        console.error('Error saving product:', error)
        toast({
          title: "Error",
          description: error.message || `Failed to ${product ? "update" : "create"} product. Please try again.`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error in form submission:', error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle adding a new feature field
  const handleAddFeature = () => {
    setFeatures([...features, ""])
  }

  // Handle updating a feature
  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...features]
    updatedFeatures[index] = value
    setFeatures(updatedFeatures)
  }

  // Handle removing a feature
  const handleRemoveFeature = (index) => {
    const updatedFeatures = [...features]
    updatedFeatures.splice(index, 1)
    setFeatures(updatedFeatures)
  }

  // Handle adding a new spec field
  const handleAddSpec = () => {
    setSpecs([...specs, { key: "", value: "" }])
  }

  // Handle updating a spec
  const handleSpecChange = (index, field, value) => {
    const updatedSpecs = [...specs]
    updatedSpecs[index][field] = value
    setSpecs(updatedSpecs)
  }

  // Handle removing a spec
  const handleRemoveSpec = (index) => {
    const updatedSpecs = [...specs]
    updatedSpecs.splice(index, 1)
    setSpecs(updatedSpecs)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" encType="multipart/form-data">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Product Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={5} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (Ksh)</Label>
              <Input id="price" type="number" step="0.01" {...register("price")} />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              {categories.length > 0 ? (
                <Select 
                  onValueChange={(value) => setValue("categoryId", value)} 
                  defaultValue={product?.categoryId || ""}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  No categories found. Please <a href="/admin/categories/new" className="underline hover:text-amber-600 dark:hover:text-amber-200">create a category</a> first.
                </div>
              )}
              {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                step="1"
                {...register("stock", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Stock cannot be negative" },
                })}
              />
              {errors.stock && <p className="text-sm text-red-500">{errors.stock.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="inStock"
                {...register("inStock")}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="inStock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Mark as In Stock
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Products with stock quantity of 0 will automatically be marked as out of stock.
              Use this checkbox to manually override the stock status.
            </p>
          </div>
        </div>

        {/* Product Image */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Product Image</Label>
            <div 
              {...getRootProps()} 
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <input {...getInputProps()} />
              {imagePreview ? (
                <div className="relative h-40 w-full">
                  <img 
                    src={imagePreview} 
                    alt="Product preview" 
                    className="h-full w-full rounded-md object-contain" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-0 top-0 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      setImageFile(null)
                      setImagePreview("")
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="mb-1 text-sm font-medium">Drag & drop an image here, or click to select</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (max. 2MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Product Features */}
          <div className="space-y-2">
            <Label>Product Features</Label>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder={`Feature ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFeature(index)}
                        disabled={features.length === 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={handleAddFeature}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Specifications */}
          <div className="space-y-2">
            <Label>Product Specifications</Label>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {specs.map((spec, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2">
                      <Input
                        className="col-span-2"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                        placeholder="Spec name"
                      />
                      <Input
                        className="col-span-2"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                        placeholder="Spec value"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSpec(index)}
                        disabled={specs.length === 1}
                        className="col-span-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={handleAddSpec}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Specification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  )
}
