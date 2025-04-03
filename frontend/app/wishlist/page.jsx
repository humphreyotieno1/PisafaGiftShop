"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, ShoppingCart, X, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function WishlistPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [wishlist, setWishlist] = useState([])
  const [loadingWishlist, setLoadingWishlist] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login?redirect=/wishlist")
    }
  }, [loading, isAuthenticated, router])

  // Fetch wishlist
  useEffect(() => {
    if (user) {
      // In a real app, this would be an API call
      // For now, we'll use dummy data
      const fetchWishlist = async () => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Dummy wishlist
          const dummyWishlist = [
            {
              id: 1,
              name: "Premium Brake Pads",
              price: 12500,
              image: "/products/default-product.svg",
              category: "Brakes",
              inStock: true,
            },
            {
              id: 2,
              name: "LED Headlight Kit",
              price: 18000,
              image: "/products/default-product.svg",
              category: "Lighting",
              inStock: true,
            },
            {
              id: 3,
              name: "Sport Exhaust System",
              price: 45000,
              image: "/products/default-product.svg",
              category: "Exhaust System",
              inStock: false,
            },
            {
              id: 4,
              name: "Alloy Wheel Set",
              price: 85000,
              image: "/products/default-product.svg",
              category: "Wheels",
              inStock: true,
            },
            {
              id: 5,
              name: "Performance Air Filter",
              price: 6500,
              image: "/products/default-product.svg",
              category: "Engine Parts",
              inStock: true,
            },
          ]
          
          setWishlist(dummyWishlist)
        } catch (error) {
          console.error('Error fetching wishlist:', error)
          toast({
            title: "Error",
            description: "Failed to load your wishlist. Please try again.",
            variant: "destructive",
          })
        } finally {
          setLoadingWishlist(false)
        }
      }

      fetchWishlist()
    }
  }, [user, toast])

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId))
    
    toast({
      title: "Item removed",
      description: "The item has been removed from your wishlist.",
    })
  }

  const addToCart = (product) => {
    // In a real app, this would be an API call to add to cart
    // For now, we'll just show a toast
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const clearWishlist = () => {
    setWishlist([])
    
    toast({
      title: "Wishlist cleared",
      description: "All items have been removed from your wishlist.",
    })
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">Products you've saved for later</p>
          </div>
          
          {wishlist.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearWishlist}>
                Clear Wishlist
              </Button>
              <Button onClick={() => router.push("/shop")}>
                Continue Shopping
              </Button>
            </div>
          )}
        </div>

        {loadingWishlist ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : wishlist.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((product, index) => (
              <motion.div
                key={product.id}
                className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => removeFromWishlist(product.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {!product.inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="mb-1 font-medium">{product.name}</h3>
                  <p className="mb-4 text-lg font-bold">Ksh {product.price.toLocaleString()}</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => router.push(`/shop/product/${product.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      className="flex-1" 
                      disabled={!product.inStock}
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16 text-center">
            <Heart className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-2xl font-bold">Your wishlist is empty</h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              Items added to your wishlist will be saved here. Start browsing our products and add your favorites!
            </p>
            <Button size="lg" onClick={() => router.push("/shop")}>
              Explore Products
            </Button>
          </div>
        )}

        {wishlist.some(product => !product.inStock) && (
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Some items are out of stock</AlertTitle>
            <AlertDescription>
              One or more items in your wishlist are currently unavailable. We'll notify you when they're back in stock.
            </AlertDescription>
          </Alert>
        )}
      </motion.div>
    </div>
  )
}
