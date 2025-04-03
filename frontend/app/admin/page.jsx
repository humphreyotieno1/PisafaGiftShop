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


export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, categoriesRes, usersRes, ordersRes, lowStockRes] = await Promise.all([
          fetch('/api/admin/products?limit=1'),
          fetch('/api/admin/categories?limit=1'),
          fetch('/api/admin/users?limit=1'),
          fetch('/api/admin/orders'),
          fetch('/api/admin/products?stock=low')
        ])

        if (!productsRes.ok || !categoriesRes.ok || !usersRes.ok || !ordersRes.ok || !lowStockRes.ok) {
          throw new Error('Failed to fetch dashboard stats')
        }

        const [products, categories, users, orders, lowStock] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          usersRes.json(),
          ordersRes.json(),
          lowStockRes.json()
        ])

        // Validate the response data
        if (!orders?.orders || !Array.isArray(orders.orders)) {
          throw new Error('Invalid orders data received')
        }

        // Calculate total revenue from completed orders
        const completedOrders = orders.orders.filter(order => order.status === 'DELIVERED')
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0)

        setStats({
          totalProducts: products.pagination.total,
          totalCategories: categories.pagination.total,
          totalUsers: users.pagination.total,
          totalRevenue: totalRevenue,
          completedOrders: completedOrders.length,
          lowStockProducts: lowStock.products.length,
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        hotToast({
          title: 'Error',
          description: 'Failed to load dashboard statistics',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const [recentProducts, setRecentProducts] = useState([])
  const [recentUsers, setRecentUsers] = useState([])

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const [productsRes, usersRes] = await Promise.all([
          fetch('/api/admin/products?limit=5&sort=createdAt&order=desc'),
          fetch('/api/admin/users?limit=5&sort=createdAt&order=desc')
        ])

        if (!productsRes.ok || !usersRes.ok) {
          throw new Error('Failed to fetch recent activity')
        }

        const [products, users] = await Promise.all([
          productsRes.json(),
          usersRes.json()
        ])

        // Ensure we have valid arrays before setting state
        if (!Array.isArray(products.products) || !Array.isArray(users.users)) {
          throw new Error('Invalid data received from API')
        }
        
        setRecentProducts(products.products)
        setRecentUsers(users.users)
      } catch (error) {
        console.error('Error fetching recent activity:', error)
        toast({
          title: 'Error',
          description: 'Failed to load recent activity',
          variant: 'destructive',
        })
      }
    }

    fetchRecentActivity()
  }, [])

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
              {loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
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
              {loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalCategories.toLocaleString()}</div>
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
              {loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
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
              {loading ? (
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
              ) : (
                <div className="text-2xl font-bold">Ksh {stats.totalRevenue.toLocaleString()}</div>
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
              {loading ? (
                <div className="h-5 w-full animate-pulse rounded-md bg-amber-200 dark:bg-amber-800" />
              ) : (
                <>
                  <span className="font-medium">{stats.lowStockProducts}</span> products are running low on stock.
                  Consider restocking soon.
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Tabs defaultValue="products">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Recent Products
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Recent Users
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="products" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recently Added Products</CardTitle>
                <CardDescription>You have added {recentProducts.length} products recently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
                      ))}
                    </div>
                  ) : (
                    recentProducts.map((product) => {
                      // Ensure product is valid
                      if (!product || typeof product !== 'object') return null;
                      
                      return (
                        <div key={product.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-1">
                            <p className="font-medium">{product.name || 'Unnamed Product'}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {product.category && typeof product.category === 'object' && product.category.name ? (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                  {product.category.name}
                                </span>
                              ) : (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                  Uncategorized
                                </span>
                              )}
                              <span>•</span>
                              <span>Ksh {(product.price || 0).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {product.createdAt ? formatDate(product.createdAt) : 'Unknown date'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recently Registered Users</CardTitle>
                <CardDescription>You have {recentUsers.length} new users recently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
                      ))}
                    </div>
                  ) : (
                    recentUsers.map((user) => {
                      // Ensure user is valid
                      if (!user || typeof user !== 'object') return null;
                      
                      return (
                        <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-1">
                            <p className="font-medium">{user.name || 'Unknown User'}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{user.email || 'No email'}</span>
                              <span>•</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  user.role === "ADMIN" 
                                    ? "bg-primary/10 text-primary" 
                                    : "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                }`}
                              >
                                {user.role || 'USER'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {user.createdAt ? formatDate(user.createdAt) : 'Unknown date'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
