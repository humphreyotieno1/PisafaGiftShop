export const runtime = 'nodejs'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth-service"

// GET /api/admin/products - Get all products
export async function GET() {
  try {
    const { isAuthenticated, isAdmin } = await verifyAuth()
    
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      include: {
        Category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the response
    const formattedProducts = products.map(product => ({
      ...product,
      categoryName: product.Category.name,
      Category: undefined
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products", details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/products - Create a new product
export async function POST(req) {
  try {
    const { isAuthenticated, isAdmin } = await verifyAuth()
    
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'categoryName']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate price
    const price = parseFloat(data.price)
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      )
    }

    // Validate stock
    const stock = parseInt(data.stock, 10) || 0
    if (stock < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      )
    }

    // Get the category to ensure it exists
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

    // Create the product with the correct category mapping
    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        description: data.description.trim(),
        price: price,
        image: data.image && data.image.length > 0 ? data.image : null,
        categoryName: category.name, // Use the exact category name from the database
        stock: stock,
        inStock: data.inStock !== undefined ? data.inStock : stock > 0,
        features: Array.isArray(data.features) ? data.features.filter(f => f.trim()).map(f => f.trim()) : [],
        specs: Array.isArray(data.specs) ? JSON.stringify(data.specs.filter(s => s.name.trim() && s.value.trim())) : '[]',
        tags: Array.isArray(data.tags) ? data.tags.filter(t => t.trim()).map(t => t.trim()) : []
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
    console.error("Error creating product:", error)
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    
    // Check for specific error types
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A product with this name already exists" },
        { status: 409 }
      )
    } else if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Invalid category reference" },
        { status: 400 }
      )
    } else if (error.message && error.message.includes('value too long')) {
      return NextResponse.json(
        { error: "Image data is too large. Please use a smaller image (max 1MB)" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create product", details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/admin/products/:id - Update a product
export async function PUT(req) {
  try {
    const { isAuthenticated, isAdmin } = await verifyAuth()
    
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Validate price if provided
    if (updateData.price !== undefined) {
      const price = parseFloat(updateData.price)
      if (isNaN(price) || price <= 0) {
        return NextResponse.json(
          { error: "Price must be a positive number" },
          { status: 400 }
        )
      }
      updateData.price = price
    }

    // Validate stock if provided
    if (updateData.stock !== undefined) {
      const stock = parseInt(updateData.stock, 10)
      if (isNaN(stock) || stock < 0) {
        return NextResponse.json(
          { error: "Stock cannot be negative" },
          { status: 400 }
        )
      }
      updateData.stock = stock
      updateData.inStock = updateData.inStock !== undefined ? updateData.inStock : stock > 0
    }

    // Validate category if provided
    if (updateData.categoryName) {
      const category = await prisma.category.findFirst({
        where: { 
          name: {
            equals: updateData.categoryName,
            mode: "insensitive"
          }
        }
      })

      if (!category) {
        return NextResponse.json(
          { error: `Category '${updateData.categoryName}' not found` },
          { status: 404 }
        )
      }

      // Use the exact category name from the database
      updateData.categoryName = category.name
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        features: Array.isArray(updateData.features) 
          ? updateData.features.filter(f => f.trim()).map(f => f.trim()) 
          : undefined,
        specs: updateData.specs !== undefined
          ? JSON.stringify(Array.isArray(updateData.specs) 
              ? updateData.specs.filter(s => s.name.trim() && s.value.trim())
              : [])
          : undefined,
        tags: Array.isArray(updateData.tags)
          ? updateData.tags.filter(t => t.trim()).map(t => t.trim())
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
