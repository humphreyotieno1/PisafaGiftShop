"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Search, 
  Filter, 
  Eye,
  MoreHorizontal,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"

export default function OrdersPage() {
  const { toast } = useToast()
  const { user, isAdmin, navigateBack } = useAuth()
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  })
  
  // Order detail dialog
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    // Store current path for navigation
    localStorage.setItem('previousPath', window.location.pathname)
    
    fetchOrders()
  }, [pagination.page, statusFilter, sortField, sortOrder])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sort: sortField,
        order: sortOrder,
      })
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      
      // Fetch orders from API
      const response = await fetch(`/api/admin/orders?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }
      
      const data = await response.json()
      setOrders(data.orders)
      setFilteredOrders(data.orders)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const query = searchQuery.toLowerCase()
    
    if (!query) {
      setFilteredOrders(orders)
      return
    }
    
    const filtered = orders.filter(order => 
      order.id.toLowerCase().includes(query) ||
      order.user.name.toLowerCase().includes(query) ||
      order.user.email.toLowerCase().includes(query)
    )
    
    setFilteredOrders(filtered)
  }

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setOrderDialogOpen(true)
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true)
      
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update order status")
      }
      
      const { order } = await response.json()
      
      // Update orders in state
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      )
      setFilteredOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      )
      
      // Update selected order if dialog is open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
      
      toast({
        title: "Status Updated",
        description: `Order status has been updated to ${formatStatus(newStatus)}.`,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount)
  }

  // Format order status
  const formatStatus = (status) => {
    switch (status) {
      case "PENDING": return "Pending"
      case "PROCESSING": return "Processing"
      case "SHIPPED": return "Shipped"
      case "DELIVERED": return "Delivered"
      case "CANCELLED": return "Cancelled"
      default: return status
    }
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "PROCESSING": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "SHIPPED": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "DELIVERED": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "CANCELLED": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING": return <Clock className="h-4 w-4" />
      case "PROCESSING": return <Package className="h-4 w-4" />
      case "SHIPPED": return <Truck className="h-4 w-4" />
      case "DELIVERED": return <CheckCircle2 className="h-4 w-4" />
      case "CANCELLED": return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      })
      navigateBack('/')
    }
  }, [user, isAdmin])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={navigateBack}>
            Back
          </Button>
          <Button onClick={() => fetchOrders()}>
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
                <Input
                  type="search"
                  placeholder="Search by order ID, customer name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="secondary">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
                setSortField("createdAt")
                setSortOrder("desc")
                fetchOrders()
              }}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Orders List</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {pagination.total} orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left font-medium">
                      <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("id")}>
                        Order ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </th>
                    <th className="pb-3 text-left font-medium">Customer</th>
                    <th className="pb-3 text-left font-medium">
                      <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("status")}>
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </th>
                    <th className="pb-3 text-left font-medium">
                      <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("total")}>
                        Total
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </th>
                    <th className="pb-3 text-left font-medium">
                      <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("createdAt")}>
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </th>
                    <th className="pb-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b"
                    >
                      <td className="py-3 text-sm">
                        <span className="font-mono text-xs">{order.id.substring(0, 8)}...</span>
                      </td>
                      <td className="py-3 text-sm">
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-xs text-muted-foreground">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 text-sm">
                        <Badge variant="outline" className={`${getStatusColor(order.status)} flex w-fit items-center gap-1`}>
                          {getStatusIcon(order.status)}
                          {formatStatus(order.status)}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3 text-sm">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-1 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={pagination.page === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page })}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Order Detail Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order ID: <span className="font-mono">{selectedOrder?.id}</span>
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                  <p className="font-medium">{selectedOrder.user.name}</p>
                  <p className="text-sm">{selectedOrder.user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Order Date</h3>
                  <p>{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge variant="outline" className={`${getStatusColor(selectedOrder.status)} flex w-fit items-center gap-1 mt-1`}>
                    {getStatusIcon(selectedOrder.status)}
                    {formatStatus(selectedOrder.status)}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
                  <p className="font-medium">{formatCurrency(selectedOrder.total)}</p>
                </div>
              </div>
              
              <Separator />
              
              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          {item.product && item.product.image ? (
                            <img 
                              src={item.product.image} 
                              alt={item.product.name || 'Product'} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.product?.name || 'Product Not Found'}</p>
                            {!item.product && (
                              <span className="text-xs text-red-500">(Deleted)</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Update Status */}
              <div>
                <h3 className="font-medium mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedOrder.status === "PENDING" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "PENDING")}
                    disabled={updatingStatus || selectedOrder.status === "PENDING"}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Pending
                  </Button>
                  <Button
                    variant={selectedOrder.status === "PROCESSING" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "PROCESSING")}
                    disabled={updatingStatus || selectedOrder.status === "PROCESSING"}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Processing
                  </Button>
                  <Button
                    variant={selectedOrder.status === "SHIPPED" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "SHIPPED")}
                    disabled={updatingStatus || selectedOrder.status === "SHIPPED"}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Shipped
                  </Button>
                  <Button
                    variant={selectedOrder.status === "DELIVERED" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "DELIVERED")}
                    disabled={updatingStatus || selectedOrder.status === "DELIVERED"}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Delivered
                  </Button>
                  <Button
                    variant={selectedOrder.status === "CANCELLED" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "CANCELLED")}
                    disabled={updatingStatus || selectedOrder.status === "CANCELLED"}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelled
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
