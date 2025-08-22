'use client';

import React, { useEffect, useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/types/api';

export default function FeaturedProducts() {
  const { featured, bestsellers, loading, error } = useProducts();
  const [featuredPage, setFeaturedPage] = useState(1);
  const [bestsellersPage, setBestsellersPage] = useState(1);
  const itemsPerPage = 4;

  const featuredTotalPages = Math.ceil(featured.length / itemsPerPage);
  const bestsellersTotalPages = Math.ceil(bestsellers.length / itemsPerPage);

  const featuredDisplay = featured.slice(
    (featuredPage - 1) * itemsPerPage,
    featuredPage * itemsPerPage
  );
  const bestsellersDisplay = bestsellers.slice(
    (bestsellersPage - 1) * itemsPerPage,
    bestsellersPage * itemsPerPage
  );

  useEffect(() => {
    setFeaturedPage(1);
    setBestsellersPage(1);
  }, [featured, bestsellers]);

  if (loading === 'loading') {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="w-full h-48 mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-600 mb-4">Failed to load featured products</p>
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

  return (
    <section className="py-16 bg-gray-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Products Section */}
        {featured.length > 0 && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our handpicked selection of the finest jewelry and accessories
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredDisplay.map((product) => (
                <ProductCard key={`featured-${product.id}`} product={product} />
              ))}
            </div>

            {featuredTotalPages > 1 && (
              <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-12">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFeaturedPage((prev) => Math.max(prev - 1, 1))}
                  disabled={featuredPage === 1}
                  className="h-10 w-10 rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all duration-200 disabled:opacity-50"
                  aria-label="Previous featured products page"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700 hover:text-blue-600 hover:rotate-6 transition-all duration-200" />
                </Button>
                {Array.from({ length: featuredTotalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="icon"
                    onClick={() => setFeaturedPage(i + 1)}
                    className={`h-8 w-8 rounded-full transition-all duration-200 ${
                      featuredPage === i + 1
                        ? 'bg-black text-white hover:bg-black/80'
                        : 'hover:bg-gray-100 hover:scale-105'
                    }`}
                    aria-label={`Go to featured products page ${i + 1}`}
                    aria-current={featuredPage === i + 1 ? 'page' : undefined}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFeaturedPage((prev) => Math.min(prev + 1, featuredTotalPages))}
                  disabled={featuredPage === featuredTotalPages}
                  className="h-10 w-10 rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all duration-200 disabled:opacity-50"
                  aria-label="Next featured products page"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700 hover:text-blue-600 hover:rotate-6 transition-all duration-200" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Bestsellers Section */}
        {bestsellers.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Bestsellers</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our most loved pieces</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {bestsellersDisplay.map((product) => (
                <ProductCard key={`bestseller-${product.id}`} product={product} />
              ))}
            </div>

            {bestsellersTotalPages > 1 && (
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setBestsellersPage((prev) => Math.max(prev - 1, 1))}
                  disabled={bestsellersPage === 1}
                  className="h-10 w-10 rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-black/70 transition-all duration-200 disabled:opacity-50"
                  aria-label="Previous bestsellers page"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700 hover:text-black/70 hover:rotate-6 transition-all duration-200" />
                </Button>
                {Array.from({ length: bestsellersTotalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="icon"
                    onClick={() => setBestsellersPage(i + 1)}
                    className={`h-8 w-8 rounded-full transition-all duration-200 ${
                      bestsellersPage === i + 1
                        ? 'bg-black text-white hover:bg-black/70'
                        : 'hover:bg-gray-100 hover:scale-105'
                    }`}
                    aria-label={`Go to bestsellers page ${i + 1}`}
                    aria-current={bestsellersPage === i + 1 ? 'page' : undefined}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setBestsellersPage((prev) => Math.min(prev + 1, bestsellersTotalPages))}
                  disabled={bestsellersPage === bestsellersTotalPages}
                  className="h-10 w-10 rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-black/70 transition-all duration-200 disabled:opacity-50"
                  aria-label="Next bestsellers page"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700 hover:text-black/70 hover:rotate-6 transition-all duration-200" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* View All Products Button */}
        <div className="text-center mt-12">
          <Link href="/shop">
            <Button
              size="lg"
              className="bg-black hover:bg-black/80 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}