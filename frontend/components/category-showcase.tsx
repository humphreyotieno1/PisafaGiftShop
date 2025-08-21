'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Category } from '@/types/api';

export default function CategoryShowcase() {
  const { categories, loading, error } = useProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const displayCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading === 'loading') {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-full h-48 mb-4 rounded-lg" />
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-600 mb-4">Failed to load categories</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">No categories available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our diverse collection of jewelry and accessories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.id}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={category.image_url || '/placeholders/no-image.svg'}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-2xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm opacity-90 max-w-xs mx-auto">
                        {category.description}
                      </p>
                    )}
                    <div className="mt-4 text-sm opacity-75">
                      {category.products.length} products
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-10 w-10 rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all duration-200 disabled:opacity-50"
              aria-label="Previous categories page"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 hover:text-blue-600 hover:rotate-6 transition-all duration-200" />
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(i + 1)}
                className={`h-8 w-8 rounded-full transition-all duration-200 ${
                  currentPage === i + 1
                    ? 'bg-primary text-white hover:bg-primary/80'
                    : 'hover:bg-gray-100 hover:scale-105'
                }`}
                aria-label={`Go to categories page ${i + 1}`}
                aria-current={currentPage === i + 1 ? 'page' : undefined}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-10 w-10 rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all duration-200 disabled:opacity-50"
              aria-label="Next categories page"
            >
              <ChevronRight className="h-5 w-5 text-gray-700 hover:text-blue-600 hover:rotate-6 transition-all duration-200" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}