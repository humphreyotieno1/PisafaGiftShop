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
import { useAuthContext } from "@/contexts/AuthContext"
import { adminApi } from "@/lib/api"
import type { Order, OrderStatus } from "@/types/api"

export default function OrdersPage() {
  const { toast } = useToast()
  const { user } = useAuthContext()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    localStorage.setItem('previousPath', window.location.pathname)
    fetchOrders()
  }, [pagination.page, statusFilter, sortField, sortOrder])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getOrders()
      let list = data
      if (statusFilter !== 'all') list = list.filter(o => o.status === statusFilter as OrderStatus)
      // simple sort
      list = list.slice().sort((a,b) => {
        const dir = sortOrder === 'asc' ? 1 : -1
        if (sortField === 'total') return (a.total - b.total) * dir
        if (sortField === 'id') return (a.id - b.id) * dir
        const da = new Date(a.created_at).getTime()
        const db = new Date(b.created_at).getTime()
        return (da - db) * dir
      })
      setOrders(list)
      setFilteredOrders(list)
      setPagination(p => ({ ...p, total: list.length, pages: Math.max(1, Math.ceil(list.length / p.limit)) }))
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({ title: "Error", description: "Failed to load orders. Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchQuery.toLowerCase()
    if (!query) { setFilteredOrders(orders); return }
    const filtered = orders.filter(order => 
      String(order.id).toLowerCase().includes(query)
    )
    setFilteredOrders(filtered)
  }

  const handleSort = (field: string) => {
    if (field === sortField) setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortOrder("asc") }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setOrderDialogOpen(true)
  }

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      setUpdatingStatus(true)
      const updated = await adminApi.updateOrder(orderId, { total: orders.find(o=>o.id===orderId)?.total || 0, status: newStatus })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      setFilteredOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus })
      toast({ title: "Status Updated", description: `Order updated to ${newStatus}.` })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString()
  const formatCurrency = (amount: number) => `Ksh ${amount.toLocaleString()}`

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "processing": return "bg-blue-100 text-blue-800"
      case "shipped": return "bg-purple-100 text-purple-800"
      case "delivered": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />
      case "processing": return <Package className="h-4 w-4" />
      case "shipped": return <Truck className="h-4 w-4" />
      case "delivered": return <CheckCircle2 className="h-4 w-4" />
      case "cancelled": return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
          <Button onClick={() => fetchOrders()}>Refresh</Button>
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3 text-sm">
                        {formatDate(order.created_at)}
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
                  <p>{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge variant="outline" className={`${getStatusColor(selectedOrder.status)} flex w-fit items-center gap-1 mt-1`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
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
                    variant={selectedOrder.status === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "pending")}
                    disabled={updatingStatus || selectedOrder.status === "pending"}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Pending
                  </Button>
                  <Button
                    variant={selectedOrder.status === "processing" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "processing")}
                    disabled={updatingStatus || selectedOrder.status === "processing"}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Processing
                  </Button>
                  <Button
                    variant={selectedOrder.status === "shipped" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "shipped")}
                    disabled={updatingStatus || selectedOrder.status === "shipped"}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Shipped
                  </Button>
                  <Button
                    variant={selectedOrder.status === "delivered" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")}
                    disabled={updatingStatus || selectedOrder.status === "delivered"}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Delivered
                  </Button>
                  <Button
                    variant={selectedOrder.status === "cancelled" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "cancelled")}
                    disabled={updatingStatus || selectedOrder.status === "cancelled"}
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
