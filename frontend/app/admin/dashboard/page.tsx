"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { motion } from "framer-motion"
import { Package, ShoppingBag, Users, CreditCard, BarChart3, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuthContext } from "@/contexts/AuthContext"
import { useOptimizedFetch } from "@/hooks/useOptimizedFetch"

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon?: any;
  linkText?: string;
  linkHref?: string;
}

// Memoized dashboard card component to prevent unnecessary re-renders
const DashboardCard = memo(({ title, value, description, icon, linkText, linkHref }: DashboardCardProps) => {
  const Icon = icon || Package

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
        {linkText && linkHref && (
          <CardFooter className="p-2">
            <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
              <a href={linkHref}>
                {linkText}
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  )
})

DashboardCard.displayName = 'DashboardCard'

export default function AdminDashboard() {
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuthContext()

    // Use optimized fetch hook for dashboard data
  const { 
    data: dashboardData, 
    loading, 
    error
  } = useOptimizedFetch(() => 
    fetch('/api/admin/dashboard').then(res => res.json())
  )

  // Extract dashboard metrics from data with fallbacks
  const metrics = dashboardData?.metrics || {
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  }

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You don\'t have permission to access this page.',
        variant: 'destructive',
      })
      return
    }
  }, [user, toast])

  // Handle fetch errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: typeof error === 'string' ? error : 'Failed to load dashboard data',
        variant: 'destructive',
      })
    }
  }, [error, toast])

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your store</p>
        </div>
        <Button variant="outline" onClick={() => window.history.back()} size="sm" className="h-9">
          Back
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          // Loading skeleton
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="h-full">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-7 w-16 animate-pulse rounded-md bg-muted mb-2" />
                <div className="h-3 w-32 animate-pulse rounded-md bg-muted" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <DashboardCard
              title="Total Products"
              value={metrics.totalProducts}
              description="Total products in your store"
              icon={Package}
              linkText="View all products"
              linkHref="/admin/products"
            />
            <DashboardCard
              title="Total Orders"
              value={metrics.totalOrders}
              description="Orders placed in your store"
              icon={ShoppingBag}
              linkText="View all orders"
              linkHref="/admin/orders"
            />
            <DashboardCard
              title="Total Customers"
              value={metrics.totalCustomers}
              description="Registered customers"
              icon={Users}
              linkText="View all customers"
              linkHref="/admin/customers"
            />
            <DashboardCard
              title="Total Revenue"
              value={formatCurrency(metrics.totalRevenue)}
              description="Revenue from all orders"
              icon={CreditCard}
              linkText="View revenue details"
              linkHref="/admin/analytics"
            />
          </>
        )}
      </div>

      {/* Recent Activity Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your store's recent activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading skeleton for recent activity
            <div className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : dashboardData?.recentActivity?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity: any, index: number) => (
                <motion.div
                  key={activity.id || index}
                  className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className={`rounded-full p-2 ${activity.type === 'order' ? 'bg-green-100' : activity.type === 'product' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    {activity.type === 'order' ? (
                      <ShoppingBag className="h-4 w-4 text-green-600" />
                    ) : activity.type === 'product' ? (
                      <Package className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Users className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">No recent activity found</p>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href="/admin/activity">
              View All Activity
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center">
            {loading ? (
              <div className="h-full w-full animate-pulse rounded-md bg-muted" />
            ) : (
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Sales chart will be displayed here</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              // Loading skeleton for top products
              <div className="space-y-4">
                {Array(3).fill(0).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
                      <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardData?.topProducts?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.topProducts.map((product: any, index: number) => (
                  <motion.div
                    key={product.id || index}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="h-10 w-10 overflow-hidden rounded-md border">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.salesCount} sales · {formatCurrency(product.price)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">No products found</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href="/admin/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}