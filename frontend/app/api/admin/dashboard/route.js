export const runtime = 'nodejs'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth-service"

// GET /api/admin/dashboard - Get dashboard statistics
export async function GET() {
  try {
    const { isAuthenticated, isAdmin } = await verifyAuth()
    
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true
        }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })
    ])

    return NextResponse.json({
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0
      },
      recentOrders
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
} 