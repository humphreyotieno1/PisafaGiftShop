"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Minus, Plus, ShoppingCart, Star, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"
import ProductCard from "@/components/product-card"
import { featuredProducts } from "@/components/featured-products"

export default function ProductPage() {
  const params = useParams()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        
        // First check if it's a featured product
        const featuredProduct = featuredProducts.find(p => p.id === params.id)
        if (featuredProduct) {
          setProduct(featuredProduct)
          // Get related products from the same category
          const related = featuredProducts
            .filter(p => p.id !== params.id && p.category === featuredProduct.category)
            .slice(0, 4)
          setRelatedProducts(related)
          setLoading(false)
          return
        }

        // If not a featured product, fetch from the database
        const response = await fetch(`/api/shop/products/${params.id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch product')
        }
        
        const data = await response.json()
        
        // Parse specs if it's a string
        if (data.specs && typeof data.specs === 'string') {
          try {
            data.specs = JSON.parse(data.specs)
          } catch (e) {
            console.error('Error parsing specs:', e)
            data.specs = []
          }
        }
        
        setProduct(data)

        // Fetch related products from the same category
        const relatedResponse = await fetch(`/api/shop/products?category=${data.categoryName.toLowerCase().replace(/\s+/g, '-')}&limit=4`)
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json()
          setRelatedProducts(relatedData.products.filter(p => p.id !== data.id))
        }
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
      addToCart(product, quantity)
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
        <Link href={`/shop?category=${product.category?.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary">
          {product.category}
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
          {product.image ? (
            <Image
              src={product.image}
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
              disabled={!product.inStock}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
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
                {Object.entries(product.specs).map(([key, value], index) => (
                  <div key={index}>
                    <p className="text-sm text-muted-foreground">{key}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
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

