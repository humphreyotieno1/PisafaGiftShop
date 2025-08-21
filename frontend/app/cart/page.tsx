"use client"

import { Suspense } from "react"
import CartContent from "@/components/cart/CartContent"

export default function CartPage() {
  return (
    <Suspense fallback={<div className="pt-32 px-4">Loading cart...</div>}>
      <CartContent />
    </Suspense>
  )
}

