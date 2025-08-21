'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import type { Category } from '@/types/api';

interface CategoryFilterProps {
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  className?: string;
}

export default function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  className = '' 
}: CategoryFilterProps) {
  const { categories, loading } = useProducts();

  if (loading === 'loading') {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="font-semibold text-gray-900">Categories</h3>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="font-semibold text-gray-900">Categories</h3>
        <p className="text-gray-500 text-sm">No categories available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="font-semibold text-gray-900">Categories</h3>
      
      <div className="space-y-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onCategoryChange(null)}
        >
          All Categories
          <Badge variant="secondary" className="ml-auto">
            {categories.reduce((total, cat) => total + cat.products.length, 0)}
          </Badge>
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
            <Badge variant="secondary" className="ml-auto">
              {category.products.length}
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  );
} 