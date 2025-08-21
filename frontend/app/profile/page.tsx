"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User as UserIcon, Mail, Phone, MapPin, Edit, Save, X, ShoppingBag, Heart } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuthContext } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { userApi } from "@/lib/api"
import { useWishlistContext } from "@/contexts/WishlistContext"

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).optional(),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuthContext()
  const { wishlist } = useWishlistContext()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", phone: "", address: "" },
  })

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login?redirect=/profile")
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      reset({
        name: user.full_name || user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      })
    }
  }, [user, reset])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await userApi.getOrders()
        setOrders(data)
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' })
      } finally {
        setLoadingOrders(false)
      }
    }
    if (isAuthenticated) fetchOrders()
  }, [isAuthenticated, toast])

  const onSubmit = async (data: any) => {
    try {
      await userApi.updateProfile({
        email: data.email || null,
        full_name: data.name || null,
        phone: data.phone || null,
        address: data.address || null,
      })
      toast({ title: 'Profile updated', description: 'Your profile has been updated successfully.' })
      setIsEditing(false)
    } catch (error) {
      toast({ title: 'Update failed', description: 'Failed to update profile.', variant: 'destructive' })
    }
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
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
                        <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="name" className="pl-10" {...register("name")} disabled={!isEditing} />
                      </div>
                      {errors.name && <p className="text-xs text-destructive">{(errors.name as any).message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" className="pl-10" {...register("email")} disabled={!isEditing} />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{(errors.email as any).message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" className="pl-10" {...register("phone")} disabled={!isEditing} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="address" className="pl-10" {...register("address")} disabled={!isEditing} />
                      </div>
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
                            <th className="whitespace-nowrap px-4 py-3 text-right font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order, index) => (
                            <motion.tr key={order.id} className="border-t" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.05 }}>
                              <td className="whitespace-nowrap px-4 py-3 font-medium">{order.id}</td>
                              <td className="whitespace-nowrap px-4 py-3">{new Date(order.created_at).toLocaleString()}</td>
                              <td className="whitespace-nowrap px-4 py-3">{order.status}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-right font-medium">Ksh {order.total.toLocaleString()}</td>
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

          <TabsContent value="wishlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Products you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                {(wishlist?.products?.length || 0) > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {wishlist!.products.map((product: any, index: number) => (
                      <motion.div key={product.id} className="relative overflow-hidden rounded-lg border bg-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.05 }}>
                        <div className="relative aspect-square">
                          <img src={product.image_url || "/products/default-product.svg"} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">Ksh {product.price.toLocaleString()}</p>
                          <div className="mt-3 flex gap-2">
                            <Button variant="outline" size="sm" className="w-full" asChild>
                              <a href={`/shop/product/${product.id}`}>View</a>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Heart className="mb-2 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-1 text-lg font-medium">Your wishlist is empty</h3>
                    <p className="text-sm text-muted-foreground">Save items you like while browsing to find them here later.</p>
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
