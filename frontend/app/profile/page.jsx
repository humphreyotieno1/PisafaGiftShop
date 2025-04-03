"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Mail, Phone, MapPin, Edit, Save, X, ShoppingBag, Heart } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingWishlist, setLoadingWishlist] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [loading, isAuthenticated, router])

  // Set form values when user data is available
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      })
    }
  }, [user, reset])

  // Fetch orders and wishlist
  useEffect(() => {
    if (user) {
      // In a real app, these would be API calls
      // For now, we'll use dummy data
      const fetchData = async () => {
        try {
          // Simulate API calls
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Dummy orders
          const dummyOrders = [
            {
              id: "ORD-001",
              date: "2023-10-15",
              status: "Delivered",
              total: 25000,
              items: 3,
            },
            {
              id: "ORD-002",
              date: "2023-11-22",
              status: "Processing",
              total: 18500,
              items: 2,
            },
            {
              id: "ORD-003",
              date: "2023-12-05",
              status: "Shipped",
              total: 42000,
              items: 4,
            },
          ]
          
          // Dummy wishlist
          const dummyWishlist = [
            {
              id: 1,
              name: "Premium Brake Pads",
              price: 12500,
              image: "/products/default-product.svg",
            },
            {
              id: 2,
              name: "LED Headlight Kit",
              price: 18000,
              image: "/products/default-product.svg",
            },
            {
              id: 3,
              name: "Sport Exhaust System",
              price: 45000,
              image: "/products/default-product.svg",
            },
          ]
          
          setOrders(dummyOrders)
          setWishlist(dummyWishlist)
        } catch (error) {
          console.error('Error fetching data:', error)
          toast({
            title: "Error",
            description: "Failed to load your data. Please try again.",
            variant: "destructive",
          })
        } finally {
          setLoadingOrders(false)
          setLoadingWishlist(false)
        }
      }

      fetchData()
    }
  }, [user, toast])

  const onSubmit = async (data) => {
    try {
      // In a real app, this would be an API call to update the user profile
      // For now, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
      
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId))
    
    toast({
      title: "Item removed",
      description: "The item has been removed from your wishlist.",
    })
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground">Manage your profile and view your orders</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your personal details</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="name" 
                          className="pl-10" 
                          {...register("name")} 
                          disabled={!isEditing} 
                        />
                      </div>
                      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email" 
                          className="pl-10" 
                          {...register("email")} 
                          disabled={!isEditing} 
                        />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="phone" 
                          className="pl-10" 
                          {...register("phone")} 
                          disabled={!isEditing} 
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="address" 
                          className="pl-10" 
                          {...register("address")} 
                          disabled={!isEditing} 
                        />
                      </div>
                      {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View your recent orders and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Order ID</th>
                            <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Date</th>
                            <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Status</th>
                            <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Items</th>
                            <th className="whitespace-nowrap px-4 py-3 text-right font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order, index) => (
                            <motion.tr
                              key={order.id}
                              className="border-t"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                              <td className="whitespace-nowrap px-4 py-3 font-medium">{order.id}</td>
                              <td className="whitespace-nowrap px-4 py-3">{order.date}</td>
                              <td className="whitespace-nowrap px-4 py-3">
                                <span 
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    order.status === "Delivered" 
                                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" 
                                      : order.status === "Processing" 
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100" 
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3">{order.items}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                                Ksh {order.total.toLocaleString()}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingBag className="mb-2 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-1 text-lg font-medium">No orders yet</h3>
                    <p className="text-sm text-muted-foreground">When you place orders, they will appear here.</p>
                    <Button className="mt-4" asChild>
                      <a href="/shop">Start Shopping</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Products you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingWishlist ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : wishlist.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {wishlist.map((product, index) => (
                      <motion.div
                        key={product.id}
                        className="relative overflow-hidden rounded-lg border bg-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <div className="relative aspect-square">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="h-full w-full object-cover" 
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8 rounded-full"
                            onClick={() => removeFromWishlist(product.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">Ksh {product.price.toLocaleString()}</p>
                          <div className="mt-3 flex gap-2">
                            <Button variant="outline" size="sm" className="w-full" asChild>
                              <a href={`/shop/product/${product.id}`}>View</a>
                            </Button>
                            <Button size="sm" className="w-full">Add to Cart</Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Heart className="mb-2 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-1 text-lg font-medium">Your wishlist is empty</h3>
                    <p className="text-sm text-muted-foreground">
                      Save items you like while browsing to find them here later.
                    </p>
                    <Button className="mt-4" asChild>
                      <a href="/shop">Explore Products</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
