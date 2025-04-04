import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/shop/products - Get all products with filtering, sorting, and pagination
export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category") || ""
    const subcategory = searchParams.get("subcategory") || ""
    const search = searchParams.get("search") || ""
    const sort = searchParams.get("sort") || "createdAt"
    const order = searchParams.get("order") || "desc"

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build filter conditions
    const where = {}
    
    if (category) {
      try {
        // First check if the category exists
        const existingCategory = await prisma.category.findUnique({
          where: { name: category }
        })
        
        if (!existingCategory) {
          return NextResponse.json(
            { error: `Category '${category}' not found` },
            { status: 404 }
          )
        }
        
        where.categoryName = category
      } catch (categoryError) {
        console.error("Error checking category:", categoryError)
        return NextResponse.json(
          { error: "Failed to check category", details: categoryError.message },
          { status: 500 }
        )
      }
    }

    if (subcategory) {
      where.subcategory = subcategory
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    try {
      // Query the database
      const [products, totalProducts] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sort]: order },
          include: {
            category: true
          }
        }),
        prisma.product.count({ where })
      ])

      return NextResponse.json({
        products,
        pagination: {
          total: totalProducts,
          page,
          limit,
          pages: Math.ceil(totalProducts / limit),
        },
      })
    } catch (queryError) {
      console.error("Error querying products:", queryError)
      return NextResponse.json(
        { error: "Failed to query products", details: queryError.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in GET /api/shop/products:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
} 