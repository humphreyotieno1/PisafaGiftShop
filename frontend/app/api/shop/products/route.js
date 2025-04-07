import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/shop/products - Get all products with filtering, sorting, and pagination
export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "8")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sort = searchParams.get("sort") || "createdAt"
    const order = searchParams.get("order") || "desc"

    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "Invalid page number" },
        { status: 400 }
      )
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid limit. Must be between 1 and 100" },
        { status: 400 }
      )
    }

    // Validate sort parameters
    const allowedSortFields = ["createdAt", "price", "name"]
    const allowedOrders = ["asc", "desc"]

    if (!allowedSortFields.includes(sort)) {
      return NextResponse.json(
        { error: `Invalid sort field. Must be one of: ${allowedSortFields.join(", ")}` },
        { status: 400 }
      )
    }

    if (!allowedOrders.includes(order)) {
      return NextResponse.json(
        { error: `Invalid order. Must be one of: ${allowedOrders.join(", ")}` },
        { status: 400 }
      )
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build filter conditions
    const where = {}
    
    if (category) {
      try {
        // Convert category slug to name (e.g., "auto-parts" to "Auto Parts")
        const categoryName = category
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

        // Check if the category exists
        const existingCategory = await prisma.category.findFirst({
          where: { 
            name: {
              equals: categoryName,
              mode: "insensitive"
            }
          }
        })
        
        if (!existingCategory) {
          return NextResponse.json(
            { error: `Category '${category}' not found` },
            { status: 404 }
          )
        }
        
        where.categoryName = existingCategory.name
      } catch (error) {
        console.error("Error checking category:", error)
        return NextResponse.json(
          { error: "Failed to check category", details: error.message },
          { status: 500 }
        )
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { features: { hasSome: [search] } },
        { tags: { hasSome: [search] } }
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
            Category: {
              select: {
                name: true
              }
            }
          }
        }),
        prisma.product.count({ where })
      ])

      // Format the response
      const formattedProducts = products.map(product => ({
        ...product,
        categoryName: product.Category.name,
        Category: undefined
      }))

      return NextResponse.json({
        products: formattedProducts,
        pagination: {
          total: totalProducts,
          page,
          limit,
          pages: Math.ceil(totalProducts / limit),
        },
      })
    } catch (error) {
      console.error("Error querying products:", error)
      return NextResponse.json(
        { error: "Failed to query products", details: error.message },
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