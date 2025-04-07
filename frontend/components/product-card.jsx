"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingCart, Star, StarHalf, StarOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"
import ProductImage from "@/components/product-image"
import { Badge } from "@/components/ui/badge"

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [isHovered, setIsHovered] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product.inStock) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
        variant: "destructive",
      })
      return
    }

    addToCart(product, 1)

    toast({
      title: "Added to cart",
      description: `${product.name} (Ksh ${product.price.toLocaleString()}) has been added to your cart.`,
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleAddToCart(e)
    }
  }

  return (
    <Link 
      href={`/shop/product/${product.id}`} 
      className="group focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-lg"
    >
      <motion.div
        className="product-card group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-lg"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative aspect-square overflow-hidden">
          <ProductImage
            src={product.image || `/placeholders/filter.jpeg`}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          
          {/* Category badge */}
          <div className="absolute left-4 top-4">
            {product.categoryName && (
              <Badge variant="secondary" className="bg-black/60 text-white hover:bg-black/70">
                {product.categoryName}
              </Badge>
            )}
          </div>

          {/* Stock status badge */}
          <div className="absolute right-4 top-4">
            <Badge variant={product.inStock ? "success" : "destructive"} className="text-xs">
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </Badge>
          </div>

          {/* Quick add to cart button */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 flex justify-center p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              onClick={handleAddToCart} 
              onKeyDown={handleKeyDown}
              className="w-full gap-2 bg-white text-black hover:bg-white/90 transition-all" 
              size="sm"
              disabled={!product.inStock}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </motion.div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="space-y-1.5 mb-4">
            <h3 className="font-semibold leading-tight tracking-tight line-clamp-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          </div>

          {/* Product Features */}
          {product.features?.length > 0 && (
            <div className="space-y-1.5 mb-4">
              <ul className="text-xs text-muted-foreground space-y-1">
                {product.features.slice(0, 2).map((feature, index) => (
                  <li key={index} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary/50" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="font-semibold">
                <span className="text-sm text-muted-foreground">Ksh</span>
                {" "}{product.price.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-medium">{product.rating || 4.5}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

