import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth-service"

// GET /api/admin/products/:id - Get a single product
export async function GET(request, { params }) {
  try {
    const { isAuthenticated, isAdmin } = await verifyAuth()
    
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

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

// PUT /api/admin/products/:id - Update a product
export async function PUT(request, { params }) {
  try {
    const { isAuthenticated, isAdmin } = await verifyAuth()
    
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Validate price if provided
    if (data.price !== undefined) {
      const price = parseFloat(data.price)
      if (isNaN(price) || price <= 0) {
        return NextResponse.json(
          { error: "Price must be a positive number" },
          { status: 400 }
        )
      }
      data.price = price
    }

    // Validate stock if provided
    if (data.stock !== undefined) {
      const stock = parseInt(data.stock, 10)
      if (isNaN(stock) || stock < 0) {
        return NextResponse.json(
          { error: "Stock cannot be negative" },
          { status: 400 }
        )
      }
      data.stock = stock
      data.inStock = data.inStock !== undefined ? data.inStock : stock > 0
    }

    // Validate category if provided
    if (data.categoryName) {
      const category = await prisma.category.findFirst({
        where: { 
          name: {
            equals: data.categoryName,
            mode: "insensitive"
          }
        }
      })

      if (!category) {
        return NextResponse.json(
          { error: `Category '${data.categoryName}' not found` },
          { status: 404 }
        )
      }

      // Use the exact category name from the database
      data.categoryName = category.name
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        features: Array.isArray(data.features) 
          ? data.features.filter(f => f.trim()).map(f => f.trim()) 
          : undefined,
        specs: data.specs !== undefined
          ? JSON.stringify(Array.isArray(data.specs) 
              ? data.specs.filter(s => s.name.trim() && s.value.trim())
              : [])
          : undefined,
        tags: Array.isArray(data.tags)
          ? data.tags.filter(t => t.trim()).map(t => t.trim())
          : undefined
      },
      include: {
        Category: {
          select: {
            name: true
          }
        }
      }
    })

    // Format the response to include category information
    const formattedProduct = {
      ...product,
      categoryName: product.Category.name,
      Category: undefined
    }

    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    } else if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A product with this name already exists" },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update product", details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/products/:id - Delete a product
export async function DELETE(request, { params }) {
  try {
    const { isAuthenticated, isAdmin } = await verifyAuth()
    
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Delete the product
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: "Product deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to delete product", details: error.message },
      { status: 500 }
    )
  }
} 