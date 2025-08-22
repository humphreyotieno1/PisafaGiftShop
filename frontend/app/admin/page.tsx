"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Home,
  BarChart3,
  Calendar,
  CreditCard
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { adminApi } from "@/lib/api"
import { motion as m } from "framer-motion"

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalProducts: 0,
      totalCategories: 0,
      totalUsers: 0,
      totalRevenue: 0,
      lowStockProducts: 0,
      completedOrders: 0,
    },
    recentActivity: {
      products: [],
      users: [],
    },
    loading: true,
    error: null,
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }))
        const analytics = await adminApi.getAnalytics()
        
        // Get products and categories count
        const [products, categories] = await Promise.all([
          adminApi.getProducts(),
          adminApi.getCategories()
        ])
        
        setDashboardData(prev => ({
          stats: {
            totalProducts: products.length,
            totalCategories: categories.length,
            totalUsers: analytics.total_users || 0,
            totalRevenue: analytics.total_revenue || 0,
            lowStockProducts: products.filter(p => p.stock < 10).length,
            completedOrders: analytics.total_orders || 0,
          },
          recentActivity: {
            products: analytics.top_products || [],
            users: [],
          },
          loading: false,
          error: null,
        }))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data'
        }))
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please try again.',
          variant: 'destructive',
        })
      }
    }

    fetchDashboardData()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [toast])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (dashboardData.error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mt-2">{dashboardData.error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to your admin dashboard</p>
        </div>
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <Home className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Total Products</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {dashboardData.loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-blue-200" />
              ) : (
                <div className="text-2xl font-bold text-blue-900">
                  {dashboardData.stats.totalProducts.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Total Categories</CardTitle>
              <ShoppingBag className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {dashboardData.loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-green-200" />
              ) : (
                <div className="text-2xl font-bold text-green-900">
                  {dashboardData.stats.totalCategories.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Total Users</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {dashboardData.loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-purple-200" />
              ) : (
                <div className="text-2xl font-bold text-purple-900">
                  {dashboardData.stats.totalUsers.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="border bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              {dashboardData.loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-orange-200" />
              ) : (
                <div className="text-2xl font-bold text-orange-900">
                  {formatCurrency(dashboardData.stats.totalRevenue)}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="border bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Low Stock Products</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              {dashboardData.loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-red-200" />
              ) : (
                <div className="text-2xl font-bold text-red-900">
                  {dashboardData.stats.lowStockProducts.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="border bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-900">Total Orders</CardTitle>
              <CreditCard className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              {dashboardData.loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-indigo-200" />
              ) : (
                <div className="text-2xl font-bold text-indigo-900">
                  {dashboardData.stats.completedOrders.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Analytics Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Overview
            </CardTitle>
            <CardDescription>
              Detailed insights into your business performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="products">Top Products</TabsTrigger>
                <TabsTrigger value="categories">Category Performance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="space-y-4">
                <div className="rounded-md border">
                  <div className="p-4">
                    <h4 className="text-sm font-medium">Top Selling Products</h4>
                    <p className="text-sm text-muted-foreground">
                      Products with the highest sales volume
                    </p>
                  </div>
                  <div className="border-t">
                    {dashboardData.loading ? (
                      <div className="p-4 space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-4">
                            <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
                            <div className="space-y-2 flex-1">
                              <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
                              <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : dashboardData.recentActivity.products.length > 0 ? (
                      <div className="p-4 space-y-3">
                        {dashboardData.recentActivity.products.map((product: any, index: number) => (
                          <div key={product.id} className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                  #{index + 1}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.total_sold} units sold • {formatCurrency(product.total_revenue)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No product data available
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="categories" className="space-y-4">
                <div className="rounded-md border">
                  <div className="p-4">
                    <h4 className="text-sm font-medium">Category Performance</h4>
                    <p className="text-sm text-muted-foreground">
                      Sales performance by category
                    </p>
                  </div>
                  <div className="border-t">
                    <div className="p-4 text-center text-muted-foreground">
                      Category performance data will be displayed here
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <Card className="border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/admin/products">
                <Button variant="outline" className="w-full h-auto p-4 flex-col gap-2">
                  <Package className="h-6 w-6" />
                  <span>Manage Products</span>
                </Button>
              </Link>
              <Link href="/admin/categories">
                <Button variant="outline" className="w-full h-auto p-4 flex-col gap-2">
                  <ShoppingBag className="h-6 w-6" />
                  <span>Manage Categories</span>
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full h-auto p-4 flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="outline" className="w-full h-auto p-4 flex-col gap-2">
                  <CreditCard className="h-6 w-6" />
                  <span>View Orders</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
