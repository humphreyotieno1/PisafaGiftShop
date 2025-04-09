import { NextResponse } from "next/server"
import { featuredProducts } from "@/components/featured-products"

// GET /api/shop/products/featured - Get featured products
export async function GET() {
  try {
    return NextResponse.json(featuredProducts)
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return NextResponse.json(
      { error: "Failed to fetch featured products", details: error.message },
      { status: 500 }
    )
  }
} 