import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth-service"

// GET /api/admin/categories - Get all categories
export async function GET(request) {
  try {
    const { isAuthenticated, isAdmin } = await verifyAuth()
    
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
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
    const allowedSortFields = ["createdAt", "name", "updatedAt"]
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
    
    if (search) {
      where.name = { contains: search, mode: "insensitive" }
    }

    // Query the database for categories
    const [categories, totalCategories] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          _count: {
            select: {
              Product: true
            }
          }
        }
      }),
      prisma.category.count({ where })
    ])

    return NextResponse.json({
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        productCount: category._count.Product,
        slug: category.name.toLowerCase().replace(/\s+/g, '-'),
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      })),
      pagination: {
        total: totalCategories,
        page,
        limit,
        pages: Math.ceil(totalCategories / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: `Failed to fetch categories: ${error.message}` },
      { status: 500 }
    )
  }
}

// POST /api/admin/categories - Create a new category
export async function POST(request) {
  try {
    const { isAuthenticated, isAdmin } = await verifyAuth()
    
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      )
    }

    // Format category name
    const name = body.name.trim()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")

    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive"
        }
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      )
    }

    // Create the category
    const category = await prisma.category.create({
      data: { name }
    })

    return NextResponse.json({ 
      category: {
        id: category.id,
        name: category.name,
        slug: category.name.toLowerCase().replace(/\s+/g, '-'),
        productCount: 0,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Failed to create category", details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/admin/categories/:id - Update a category
export async function PUT(request, { params }) {
  try {
    const { isAuthenticated, isAdmin } = await verifyAuth()
    
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      )
    }

    // Format category name
    const name = body.name.trim()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")

    // Check if another category with the same name exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive"
        },
        NOT: {
          id
        }
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      )
    }
    
    // Update the category
    const category = await prisma.category.update({
      where: { id },
      data: { name }
    })

    return NextResponse.json({ 
      category: {
        id: category.id,
        name: category.name,
        slug: category.name.toLowerCase().replace(/\s+/g, '-'),
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    })
  } catch (error) {
    console.error("Error updating category:", error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update category", details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/categories/:id - Delete a category
export async function DELETE(request, { params }) {
  try {
    const { isAuthenticated, isAdmin } = await verifyAuth()
    
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      )
    }

    // Check if category has associated products
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            Product: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    if (category._count.Product > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated products" },
        { status: 400 }
      )
    }

    // Delete the category
    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: "Category deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting category:", error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to delete category", details: error.message },
      { status: 500 }
    )
  }
}
