"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Minus, Plus, ShoppingCart, Star, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCartContext } from "@/contexts/CartContext"
import { useToast } from "@/components/ui/use-toast"
import ProductCard from "@/components/product-card"
import { shopApi } from "@/lib/api"


export default function ProductPage() {
  const params = useParams()
  const { addToCart } = useCartContext()
  const { toast } = useToast()
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const id = Number(params.id)
        const data = await shopApi.getProductById(id)
        setProduct(data)
        try {
          const featured = await shopApi.getFeatured(4)
          setRelatedProducts(featured.filter((p) => p.id !== data.id))
        } catch {}
      } catch (error) {
        console.error('Error fetching product:', error)
        toast({
          title: 'Error',
          description: 'Failed to load product. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, toast])

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity)
      toast({
        title: "Added to cart",
        description: `${product.name} (${quantity} ${quantity === 1 ? "item" : "items"} - Ksh ${(product.price * quantity).toLocaleString()}) has been added to your cart.`,
      })
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/shop">Back to Shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="mb-6 flex items-center text-sm text-muted-foreground">
        <Link href="/shop" className="hover:text-primary">Shop</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="hover:text-primary">Category</span>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="mt-2 flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-muted-foreground">{product.rating || 0} out of 5</span>
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-primary">
              <span className="text-lg font-normal text-muted-foreground">Ksh</span>
              {" "}{product.price.toLocaleString()}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {/* Quantity Selector */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={increaseQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>

          {/* Product Features */}
          {product.features && product.features.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Features</h2>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Product Specifications */}
          {product.specs && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                {Array.isArray(product.specs) ? (
                  product.specs.map((spec, index) => (
                    <div key={index}>
                      <p className="text-sm text-muted-foreground">{spec.name}</p>
                      <p className="font-medium">{spec.value}</p>
                    </div>
                  ))
                ) : (
                  Object.entries(product.specs).map(([key, value], index) => (
                    <div key={index}>
                      <p className="text-sm text-muted-foreground">{key}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

