"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"

export default function CartPage() {
  const router = useRouter()
  const { cartItems, updateCartItemQuantity, removeFromCart, getCartTotal, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return
    updateCartItemQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId) => {
    removeFromCart(productId)
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    })
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to proceed to checkout.",
        variant: "destructive",
      })
      router.push("/auth/login?redirect=/cart")
      return
    }

    setIsProcessing(true)

    // Simulate checkout process
    setTimeout(() => {
      setIsProcessing(false)
      clearCart()
      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!",
      })
      router.push("/checkout/success")
    }, 2000)
  }

  const subtotal = getCartTotal()
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + shipping

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border">
            <div className="hidden border-b p-4 sm:grid sm:grid-cols-6">
              <div className="col-span-3 font-medium">Product</div>
              <div className="col-span-1 text-center font-medium">Price</div>
              <div className="col-span-1 text-center font-medium">Quantity</div>
              <div className="col-span-1 text-right font-medium">Total</div>
            </div>

            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 border-b p-4 sm:grid-cols-6"
              >
                {/* Product */}
                <div className="col-span-3 flex items-center">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <Link href={`/shop/product/${item.id}`} className="font-medium hover:text-primary">
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="mt-1 flex w-fit items-center text-xs text-destructive hover:underline sm:hidden"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-1 flex items-center justify-between sm:justify-center">
                  <span className="font-medium sm:hidden">Price:</span>
                  <span>${item.price.toFixed(2)}</span>
                </div>

                {/* Quantity */}
                <div className="col-span-1 flex items-center justify-between sm:justify-center">
                  <span className="font-medium sm:hidden">Quantity:</span>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="mx-2 w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Total */}
                <div className="col-span-1 flex items-center justify-between sm:justify-end">
                  <span className="font-medium sm:hidden">Total:</span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>

                {/* Remove Button (Desktop) */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="col-span-6 mt-2 hidden items-center justify-end text-xs text-destructive hover:underline sm:flex"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Remove
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-bold">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Including taxes</p>
              </div>
            </div>

            <Button onClick={handleCheckout} className="mt-6 w-full gap-2" size="lg" disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Checkout"}
              {!isProcessing && <ArrowRight className="h-4 w-4" />}
            </Button>

            <div className="mt-4 text-center">
              <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

