import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth-service"

// PUT /api/admin/categories/[id] - Update a category
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
      data: { 
        name,
        image: body.image // Include image data in the update
      }
    })

    return NextResponse.json({ 
      category: {
        id: category.id,
        name: category.name,
        image: category.image,
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

// DELETE /api/admin/categories/[id] - Delete a category
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

    // Check if category exists and has associated products
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