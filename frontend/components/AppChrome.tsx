"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideChrome = pathname.startsWith("/auth") || pathname.startsWith("/admin")

  return (
    <div className="flex min-h-screen flex-col w-full">
      {!hideChrome && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideChrome && <Footer />}
    </div>
  )
}

