"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingCart, Star, StarHalf, StarOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"
import ProductImage from "@/components/product-image"

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [isHovered, setIsHovered] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

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
        whileHover={{ y: -5, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative">
          <ProductImage
            src={product.image || `/placeholders/filter.jpeg`}
            alt={product.name}
            className="rounded-t-lg"
          />
          
          {/* Category badge */}
          <div className="absolute left-4 top-4">
            <span 
              className="inline-flex items-center rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm"
              role="text"
              aria-label={`Product category: ${product.category}`}
            >
              {product.category}
            </span>
          </div>

          {/* Quick add to cart button */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 flex justify-center p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Button 
              onClick={handleAddToCart} 
              onKeyDown={handleKeyDown}
              className="w-full gap-2 bg-black text-white hover:bg-black/90 hover:scale-[1.02] transition-all focus-visible:ring-offset-0" 
              size="sm"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </motion.div>
        </div>

        <div className="flex flex-1 flex-col p-4 space-y-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-1.5 bg-accent/5 px-2.5 py-1.5 rounded-full">
              <div className="flex items-center gap-0.5" role="img" aria-label={`Rating: ${product.rating} out of 5 stars`}>
                {[...Array(5)].map((_, index) => {
                  const starValue = index + 1;
                  const rating = product.rating;
                  
                  if (starValue <= rating) {
                    return <Star key={index} className="h-3.5 w-3.5 fill-primary text-primary" aria-hidden="true" />;
                  } else if (starValue - 0.5 <= rating) {
                    return <StarHalf key={index} className="h-3.5 w-3.5 fill-primary text-primary" aria-hidden="true" />;
                  } else {
                    return <StarOff key={index} className="h-3.5 w-3.5 text-accent" aria-hidden="true" />;
                  }
                })}
              </div>
              <span className="text-sm font-medium sr-only">{product.rating} out of 5 stars</span>
              <span className="text-sm font-medium" aria-hidden="true">{product.rating}</span>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <h3 className="text-base font-semibold leading-tight tracking-tight">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{product.description}</p>
            
            {/* Product Features */}
            {product.features && (
              <ul className="text-xs text-muted-foreground space-y-1 pt-1">
                {product.features.slice(0, 2).map((feature, index) => (
                  <li key={index} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-accent/50" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            {/* Product Specs */}
            {product.specs && (
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-accent/5 p-3 text-xs">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="space-y-0.5">
                    <div className="font-medium text-muted-foreground capitalize">{key}</div>
                    <div className="font-medium text-foreground">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5 group/price transition-colors hover:bg-accent/5 rounded-full py-1 px-2 -ml-2">
                <div className="text-xl font-bold tracking-tight">
                  <span className="text-sm font-normal text-muted-foreground">Ksh</span>
                  {" "}{product.price.toLocaleString()}
                </div>
                <span className="text-xs text-muted-foreground group-hover/price:text-foreground transition-colors">
                  {product.category === "Wheels" ? "/set" :
                   product.category === "Brakes" ? "/pair" :
                   product.category === "Lighting" ? "/pair" :
                   "/piece"}
                </span>
              </div>
              {product.inStock ? (
                <span 
                  className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-500"
                  role="status"
                  aria-label="Product is in stock"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-500" aria-hidden="true" />
                  In Stock
                </span>
              ) : (
                <span 
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-500"
                  role="status"
                  aria-label="Product is out of stock"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-500" aria-hidden="true" />
                  Out of Stock
                </span>
              )}
            </div>
            <Button 
              onClick={handleAddToCart} 
              onKeyDown={handleKeyDown}
              size="sm" 
              variant="ghost" 
              className="hidden md:flex gap-2 bg-black text-white hover:bg-black/90 rounded-full focus-visible:ring-offset-0"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

