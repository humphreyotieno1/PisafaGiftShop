"use client"

import { Suspense } from "react"
import ShopContent from "@/components/shop/ShopContent"

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  )
}

