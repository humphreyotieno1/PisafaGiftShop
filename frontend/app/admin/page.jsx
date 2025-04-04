"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

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
        
        // Use single dashboard endpoint
        const response = await fetch('/api/admin/dashboard')

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const data = await response.json()

        setDashboardData({
          stats: {
            totalProducts: data.stats.totalProducts || 0,
            totalCategories: data.stats.totalCategories || 0,
            totalUsers: data.stats.totalUsers || 0,
            totalRevenue: data.stats.totalRevenue || 0,
            lowStockProducts: data.stats.lowStockProducts || 0,
            completedOrders: data.stats.completedOrders || 0,
          },
          recentActivity: {
            products: data.recentOrders || [],
            users: data.recentUsers || [],
          },
          loading: false,
          error: null,
        })
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

  const formatDate = (dateString) => {
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dashboardData.loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
              ) : (
                <div className="text-2xl font-bold">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dashboardData.loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
              ) : (
                <div className="text-2xl font-bold">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dashboardData.loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
              ) : (
                <div className="text-2xl font-bold">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dashboardData.loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
              ) : (
                <div className="text-2xl font-bold">Ksh {dashboardData.stats.totalRevenue.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alert Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Inventory Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 dark:text-amber-300">
              {dashboardData.loading ? (
                <div className="h-5 w-full animate-pulse rounded-md bg-amber-200 dark:bg-amber-800" />
              ) : (
                <>
                  <span className="font-medium">{dashboardData.stats.lowStockProducts}</span> products are running low on stock.
                  Consider restocking soon.
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Products</CardTitle>
              <CardDescription>Latest products added to the store</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
              ) : dashboardData.recentActivity.products.length === 0 ? (
                <p className="text-muted-foreground">No recent products</p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentActivity.products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Added {formatDate(product.createdAt)}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Ksh {product.price.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest users registered</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
              ) : dashboardData.recentActivity.users.length === 0 ? (
                <p className="text-muted-foreground">No recent users</p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentActivity.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Joined {formatDate(user.createdAt)}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.role}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
