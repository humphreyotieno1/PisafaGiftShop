'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { adminApi } from '@/lib/api';
import { validateForm, type ProductFormData } from '@/utils/validation';
import { productSchema } from '@/utils/validation';
import type { Product, Category } from '@/types/api';

interface ProductFormProps {
  product?: Product;
  mode: 'create' | 'edit';
}

export default function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { categories } = useProducts();
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    category_id: product?.category_id || 0,
    image_url: product?.image_url || '',
    is_bestseller: product?.is_bestseller || false,
    is_featured: product?.is_featured || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ProductFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(productSchema, formData);
    if (!validation.success) {
      const formattedErrors = validation.errors.errors.reduce((acc, error) => {
        const fieldName = error.path.join('.');
        acc[fieldName] = error.message;
        return acc;
      }, {} as Record<string, string>);
      setErrors(formattedErrors);
      toast({ title: 'Validation failed', description: 'Please check the form fields', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await adminApi.createProduct({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          category_id: formData.category_id,
          image_url: formData.image_url || undefined,
          is_bestseller: formData.is_bestseller,
          is_featured: formData.is_featured,
        });
      } else if (product) {
        await adminApi.updateProduct(product.id, {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          category_id: formData.category_id,
          image_url: formData.image_url || undefined,
          is_bestseller: formData.is_bestseller,
          is_featured: formData.is_featured,
        });
      }
      toast({ title: mode === 'create' ? 'Product created' : 'Product updated' });
      router.push('/admin/products');
    } catch (error) {
      toast({ title: 'Failed to save product', description: 'Please try again', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          {mode === 'create' ? 'Create New Product' : 'Edit Product'}
        </h2>
        
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter product name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter product description"
            rows={4}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (KES) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={errors.price ? 'border-red-500' : ''}
            />
            {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
              placeholder="0"
              className={errors.stock ? 'border-red-500' : ''}
            />
            {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category_id.toString()}
            onValueChange={(value) => handleInputChange('category_id', parseInt(value))}
          >
            <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            type="url"
            value={formData.image_url}
            onChange={(e) => handleInputChange('image_url', e.target.value)}
            placeholder="https://example.com/image.jpg"
            className={errors.image_url ? 'border-red-500' : ''}
          />
          {errors.image_url && <p className="text-sm text-red-500">{errors.image_url}</p>}
        </div>

        {/* Flags */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => handleInputChange('is_featured', checked as boolean)}
            />
            <Label htmlFor="is_featured">Featured Product</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_bestseller"
              checked={formData.is_bestseller}
              onCheckedChange={(checked) => handleInputChange('is_bestseller', checked as boolean)}
            />
            <Label htmlFor="is_bestseller">Bestseller</Label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex space-x-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
