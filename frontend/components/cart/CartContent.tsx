"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCartContext } from "@/contexts/CartContext"
import { useAuthContext } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"

export default function CartContent() {
  const router = useRouter()
  const { cart, updateQuantity, removeFromCart, cartTotal, checkout } = useCartContext()
  const { isAuthenticated } = useAuthContext()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set())
  const [showCheckoutForm, setShowCheckoutForm] = useState(false)
  const [checkoutData, setCheckoutData] = useState({
    address: '',
    phone_number: '',
    payment_method: 'mpesa'
  })

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      // Remove item if quantity is 0 or negative
      await handleRemoveItem(productId)
      return
    }

    setUpdatingItems(prev => new Set(prev).add(productId))
    try {
      const success = await updateQuantity(productId, newQuantity)
      if (success) {
        toast({ title: "Quantity updated", description: "Cart item quantity has been updated." })
      } else {
        toast({ title: "Update failed", description: "Failed to update quantity. Please try again.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Update failed", description: "Failed to update quantity. Please try again.", variant: "destructive" })
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (productId: number) => {
    setUpdatingItems(prev => new Set(prev).add(productId))
    try {
      const success = await removeFromCart(productId)
      if (success) {
        toast({ title: "Item removed", description: "The item has been removed from your cart." })
      } else {
        toast({ title: "Remove failed", description: "Failed to remove item. Please try again.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Remove failed", description: "Failed to remove item. Please try again.", variant: "destructive" })
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast({ title: "Please sign in", description: "You need to be signed in to proceed to checkout.", variant: "destructive" })
      router.push("/auth/login?redirect=/cart")
      return
    }

    if (!checkoutData.address || !checkoutData.phone_number) {
      toast({ title: "Missing information", description: "Please fill in all required fields.", variant: "destructive" })
      return
    }

    setIsProcessing(true)
    try {
      const res = await checkout(checkoutData)
      if (res) {
        toast({ title: 'Checkout initiated', description: res.message })
        router.push('/orders')
      }
    } catch (e) {
      toast({ title: 'Checkout failed', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }

  const subtotal = cart?.subtotal ?? cartTotal
  const tax = cart?.tax ?? 0
  const total = cart?.total ?? cartTotal

  if (!cart || cart.products.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-32 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <ShoppingBag className="mx-auto mb-6 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="mb-8 text-muted-foreground">Looks like you haven't added any products to your cart yet.</p>
          <Button asChild size="lg">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl pt-32 px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border">
            <div className="hidden border-b p-4 sm:grid sm:grid-cols-6">
              <div className="col-span-3 font-medium">Product</div>
              <div className="col-span-1 text-center font-medium">Price</div>
              <div className="col-span-1 text-center font-medium">Quantity</div>
              <div className="col-span-1 text-right font-medium">Total</div>
            </div>

            {cart.products.map((item) => {
              const isUpdating = updatingItems.has(item.product_id)
              return (
                <motion.div key={item.product_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 border-b p-4 sm:grid-cols-6">
                  <div className="col-span-3 flex items-center">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                      <Image src={item.product.image_url || "/products/default-product.svg"} alt={item.product.name} fill className="object-cover object-center" />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <Link href={`/shop/product/${item.product_id}`} className="font-medium hover:text-primary">{item.product.name}</Link>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <button 
                        onClick={() => handleRemoveItem(item.product_id)} 
                        disabled={isUpdating}
                        className="mt-1 flex w-fit items-center text-xs text-destructive hover:underline sm:hidden disabled:opacity-50"
                      >
                        <Trash2 className="mr-1 h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center justify-between sm:justify-center">
                    <span className="font-medium sm:hidden">Price:</span>
                    <span>Ksh {item.product.price.toFixed(2)}</span>
                  </div>
                  <div className="col-span-1 flex items-center justify-between sm:justify-center">
                    <span className="font-medium sm:hidden">Quantity:</span>
                    <div className="flex items-center">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                        disabled={isUpdating}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="mx-2 w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                        disabled={isUpdating}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center justify-between sm:justify-end">
                    <span className="font-medium sm:hidden">Total:</span>
                    <span className="font-medium">Ksh {item.item_total.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item.product_id)} 
                    disabled={isUpdating}
                    className="col-span-6 mt-2 hidden items-center justify-end text-xs text-destructive hover:underline sm:flex disabled:opacity-50"
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Remove
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-bold">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between"><span>Subtotal</span><span>Ksh {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax ({((cart?.tax_rate ?? 0) * 100).toFixed(0)}%)</span><span>Ksh {tax.toFixed(2)}</span></div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold"><span>Total</span><span>Ksh {total.toFixed(2)}</span></div>
                <p className="mt-1 text-xs text-muted-foreground">Including taxes</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCheckoutForm(true)} 
              className="mt-6 w-full gap-2" 
              size="lg"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="mt-4 text-center">
              <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Form Modal */}
      {showCheckoutForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Checkout</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCheckoutForm(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  value={checkoutData.address}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCheckoutData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your delivery address"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">M-Pesa Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={checkoutData.phone_number}
                  onChange={(e) => setCheckoutData(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="e.g., 254700000000"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="payment">Payment Method</Label>
                <Select
                  value={checkoutData.payment_method}
                  onValueChange={(value) => setCheckoutData(prev => ({ ...prev, payment_method: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="cash">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold mb-2">
                  <span>Total:</span>
                  <span>Ksh {total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {checkoutData.payment_method === 'mpesa' 
                    ? 'You will receive an M-Pesa prompt to complete payment.'
                    : 'Pay with cash when your order is delivered.'
                  }
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCheckoutForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

