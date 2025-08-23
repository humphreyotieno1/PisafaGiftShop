"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ProductForm from "@/components/admin/product-form"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { toast } = useToast()
  const [product, setProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Dummy categories
        const dummyCategories = [
          { id: "1", name: "Brakes" },
          { id: "2", name: "Wheels" },
          { id: "3", name: "Lighting" },
          { id: "4", name: "Engine Parts" },
          { id: "5", name: "Body Parts" },
          { id: "6", name: "Interior" },
          { id: "7", name: "Suspension" },
          { id: "8", name: "Transmission" },
          { id: "9", name: "Cooling System" },
          { id: "10", name: "Exhaust System" },
        ]
        
        // Dummy product data
        const dummyProduct = {
          id,
          name: "Premium Brake Pads",
          description: "High-quality brake pads for optimal stopping power and durability. Designed for all weather conditions.",
          price: 4500,
          categoryId: "1",
          inStock: true,
          image: "/products/brake-pads.jpg",
          features: [
            "Ceramic composite material",
            "Low dust formula",
            "Extended lifespan",
            "Quiet operation"
          ],
          specs: {
            "Material": "Ceramic composite",
            "Position": "Front/Rear",
            "Warranty": "12 months",
            "Noise Level": "Low"
          }
        }
        
        setCategories(dummyCategories)
        setProduct(dummyProduct)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load product data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, toast])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to products</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Update the details for this product</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : product ? (
            <ProductForm product={product} categories={categories} />
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Product not found. It may have been deleted or the ID is invalid.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
