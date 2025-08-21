'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

interface CategorySidebarProps {
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  className?: string;
}

export default function CategorySidebar({ 
  selectedCategory, 
  onCategoryChange, 
  className = '' 
}: CategorySidebarProps) {
  const { categories, loading } = useProducts();

  if (loading === 'loading') {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="font-semibold text-gray-900">Categories</h3>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="font-semibold text-gray-900 text-lg">Categories</h3>
      
      <div className="space-y-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'ghost'}
          className="w-full justify-start h-12"
          onClick={() => onCategoryChange(null)}
        >
          <span className="flex-1 text-left">All Categories</span>
          <Badge variant="secondary" className="ml-2">
            {categories.reduce((total, cat) => total + cat.products.length, 0)}
          </Badge>
        </Button>
        
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'ghost'}
            className="w-full justify-start h-12"
            onClick={() => onCategoryChange(category.id)}
          >
            <span className="flex-1 text-left">{category.name}</span>
            <Badge variant="secondary" className="ml-2">
              {category.products.length}
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  );
}

