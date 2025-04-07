import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/shop/categories - Get all categories with product counts
export async function GET() {
  try {
    // Query the database for all categories with product counts
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { Product: true }
        }
      }
    })

    // Format the response
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      productCount: category._count.Product,
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }))

    return NextResponse.json({
      categories: formattedCategories
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    
    // Check for specific error types
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Duplicate category name", details: error.message },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch categories", details: error.message },
      { status: 500 }
    )
  }
} 