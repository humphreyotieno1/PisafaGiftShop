import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/shop/products/[id] - Get a single product by ID
export async function GET(request, { params }) {
  try {
    const { id } = params

    // Query the database for the product
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        Category: {
          select: {
            name: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Format the response
    const formattedProduct = {
      ...product,
      categoryName: product.Category.name,
      Category: undefined
    }

    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product", details: error.message },
      { status: 500 }
    )
  }
} 