import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/types/api";
import { formatCurrency } from "@/utils/helpers";
import { useWishlistContext } from "@/contexts/WishlistContext";
import { useCartContext } from "@/contexts/CartContext";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistContext();
  const { addToCart } = useCartContext();
  const inWishlist = isInWishlist(product.id);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) await removeFromWishlist(product.id);
    else await addToWishlist(product.id);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.id, 1);
  };

  return (
    <motion.div 
      className={`group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md ${className}`}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/shop/product/${product.id}`} className="block flex-1">
        <div className="relative aspect-square overflow-hidden">
          <div className="h-full w-full bg-muted/25 flex items-center justify-center">
            <img
              src={product.image_url || "/placeholders/no-image.svg"}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          
          <Badge variant="default" className="absolute left-3 top-3 bg-primary/90 hover:bg-primary text-primary-foreground">
            {product.is_bestseller ? 'Bestseller' : 'Featured'}
          </Badge>

          <motion.div
            className="absolute bottom-0 left-0 right-0 flex justify-center p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={handleAddToCart}
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
              size="sm"
              disabled={product.stock <= 0}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          </motion.div>
        </div>

        <div className="flex-1 flex flex-col p-4">
          <div className="space-y-1.5 mb-3">
            <h3 className="font-semibold leading-tight line-clamp-2">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>

          <div className="mt-auto pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="font-semibold">
                <span className="text-sm text-muted-foreground">Ksh</span>{" "}
                {formatCurrency(product.price)}
              </div>
            </div>

            <div className="absolute right-3 bottom-4">
            <Badge 
              variant={product.stock > 0 ? "default" : "destructive"} 
              className="text-xs"
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Badge>
          </div>
          </div>
        </div>
      </Link>

      <button
        onClick={toggleWishlist}
        className={`absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors ${
          inWishlist ? 'text-red-600' : 'text-muted-foreground hover:text-red-600'
        }`}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart 
          className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} 
        />
      </button>
    </motion.div>
  );
}
