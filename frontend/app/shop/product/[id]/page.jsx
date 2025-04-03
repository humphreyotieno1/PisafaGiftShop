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
import { generateProducts } from "@/lib/dummy-data"
import ProductCard from "@/components/product-card"

export default function ProductPage() {
  const params = useParams()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    // In a real app, this would be an API call
    const productId = Number.parseInt(params.id)
    const allProducts = generateProducts(100)
    const foundProduct = allProducts.find((p) => p.id === productId)

    if (foundProduct) {
      setProduct(foundProduct)

      // Get related products from the same category
      const related = allProducts.filter((p) => p.category === foundProduct.category && p.id !== productId).slice(0, 4)
      setRelatedProducts(related)
    }

    setLoading(false)
  }, [params.id])

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
      <div className="mx-auto max-w-7xl px-4 py-16 pt-24">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="h-[400px] w-full animate-pulse rounded-lg bg-muted md:w-1/2" />
          <div className="flex w-full flex-col md:w-1/2">
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-6 w-1/4 animate-pulse rounded bg-muted" />
            <div className="mt-8 h-24 w-full animate-pulse rounded bg-muted" />
            <div className="mt-8 h-10 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 pt-24 text-center">
        <h1 className="mb-4 text-2xl font-bold">Product Not Found</h1>
        <p className="mb-8 text-muted-foreground">
          The product you are looking for does not exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/shop">Back to Shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 pt-24">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li className="mx-2">
            <ChevronRight className="h-4 w-4" />
          </li>
          <li>
            <Link href="/shop" className="hover:text-primary">
              Shop
            </Link>
          </li>
          <li className="mx-2">
            <ChevronRight className="h-4 w-4" />
          </li>
          <li>
            <Link
              href={`/shop/category/${product.category.toLowerCase().replace(/\s+/g, "-")}`}
              className="hover:text-primary"
            >
              {product.category}
            </Link>
          </li>
          <li className="mx-2">
            <ChevronRight className="h-4 w-4" />
          </li>
          <li className="font-medium text-foreground">{product.name}</li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/2"
        >
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-background">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain p-4"
              priority
            />
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex w-full flex-col md:w-1/2"
        >
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="mt-2 flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-muted-foreground">{product.rating} out of 5</span>
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-primary">
              <span className="text-lg font-normal text-muted-foreground">Ksh</span>
              {" "}{product.price.toLocaleString()}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.category === "Wheels" ? "/set" :
               product.category === "Brakes" ? "/pair" :
               product.category === "Lighting" ? "/pair" :
               "/piece"}
            </span>
          </div>

          <div className="mt-6">
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {/* Quantity Selector */}
          <div className="mt-8 flex items-center">
            <span className="mr-4 text-sm font-medium">Quantity:</span>
            <div className="flex items-center">
              <Button variant="outline" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-4 w-8 text-center">{quantity}</span>
              <Button variant="outline" size="icon" onClick={increaseQuantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button 
            onClick={handleAddToCart} 
            size="lg" 
            className="mt-8 gap-2 bg-black text-white hover:bg-black/90 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </Button>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <Truck className="mb-2 h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Free Shipping</span>
              <span className="text-xs text-muted-foreground">On orders over Ksh 10,000</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield className="mb-2 h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Warranty</span>
              <span className="text-xs text-muted-foreground">{product.specs?.warranty || 'Standard warranty'}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <RotateCcw className="mb-2 h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Easy Returns</span>
              <span className="text-xs text-muted-foreground">30-day money back</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Product Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <div className="prose max-w-none">
              <p>{product.description}</p>
              <p>
                This high-quality {product.name.toLowerCase()} is designed to provide optimal performance and
                durability. Made from premium materials, it ensures reliable operation and long-lasting use. Compatible
                with most vehicle makes and models, it's an excellent choice for both professional mechanics and DIY
                enthusiasts.
              </p>
              <p>
                Our products undergo rigorous quality control to ensure they meet the highest standards. We stand behind
                our products with a {product.specs?.warranty || 'standard'} warranty for your peace of mind.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="mt-6">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <th className="bg-muted px-4 py-2 text-left font-medium">Material</th>
                    <td className="px-4 py-2">{product.specs?.material || 'Standard material'}</td>
                  </tr>
                  <tr className="border-b">
                    <th className="bg-muted px-4 py-2 text-left font-medium">Dimensions</th>
                    <td className="px-4 py-2">Varies by model</td>
                  </tr>
                  <tr className="border-b">
                    <th className="bg-muted px-4 py-2 text-left font-medium">Weight</th>
                    <td className="px-4 py-2">Varies by model</td>
                  </tr>
                  <tr>
                    <th className="bg-muted px-4 py-2 text-left font-medium">Warranty</th>
                    <td className="px-4 py-2">{product.specs?.warranty || 'Standard warranty'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="shipping" className="mt-6">
            <div className="prose max-w-none">
              <h3>Shipping Information</h3>
              <p>
                We offer free shipping on all orders over $100. Standard shipping typically takes 3-5 business days,
                depending on your location. Express shipping options are available at checkout for an additional fee.
              </p>

              <h3>Return Policy</h3>
              <p>
                We accept returns within 30 days of delivery for a full refund or exchange. The product must be in its
                original condition and packaging. Please note that shipping costs for returns are the responsibility of
                the customer unless the return is due to our error or a defective product.
              </p>

              <h3>Warranty</h3>
              <p>
                This product comes with a {product.specs?.warranty || 'standard'} warranty against manufacturing defects. The
                warranty does not cover damage due to improper use, accidents, or normal wear and tear. Please contact
                our customer service team for warranty claims.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

