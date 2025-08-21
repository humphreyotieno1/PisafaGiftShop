"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, ShoppingCart, X, AlertCircle } from "lucide-react"
import { useAuthContext } from "@/contexts/AuthContext"
import { useWishlistContext } from "@/contexts/WishlistContext"
import { useCartContext } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function WishlistPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuthContext()
  const { wishlist, loading: wishlistLoading, removeFromWishlist, addToWishlist, refreshWishlist } = useWishlistContext()
  const { addToCart } = useCartContext()
  const { toast } = useToast()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login?redirect=/wishlist")
    }
  }, [loading, isAuthenticated, router])

  // Ensure wishlist is loaded
  // Data is fetched in WishlistProvider on mount

  const handleRemove = async (productId: number) => {
    const ok = await removeFromWishlist(productId)
    if (ok) {
      toast({ title: "Item removed", description: "Removed from your wishlist." })
    }
  }

  const handleAddToCart = async (product: any) => {
    const ok = await addToCart(product.id, 1)
    if (ok) {
      toast({ title: "Added to cart", description: `${product.name} added to cart.` })
    }
  }

  const clearWishlist = async () => {
    try {
      const ids = (wishlist?.products || []).map((p: any) => p.id)
      for (const id of ids) {
        // remove each item sequentially to keep UI in sync
        // eslint-disable-next-line no-await-in-loop
        await removeFromWishlist(id)
      }
      toast({ title: "Wishlist cleared", description: "All items have been removed from your wishlist." })
    } catch {
      toast({ title: "Failed to clear wishlist", variant: "destructive" })
    }
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

        {wishlistLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (wishlist?.products?.length || 0) > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist!.products.map((product: any, index: number) => (
              <motion.div
                key={product.id}
                className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={product.image_url || "/products/default-product.svg"} 
                    alt={product.name} 
                    className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => handleRemove(product.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {product.stock <= 0 && (
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
                      Ksh {product.price.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="mb-1 font-medium">{product.name}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{product.description?.slice(0, 64)}...</p>
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
                      disabled={product.stock <= 0}
                      onClick={() => handleAddToCart(product)}
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

        {(wishlist?.products || []).some((product: any) => product.stock <= 0) && (
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
