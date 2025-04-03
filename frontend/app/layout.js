import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/context/cart-context"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ToastProvider } from "@/components/ui/use-toast"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import WhatsAppButton from "@/components/whatsapp-button"
import BackToTopButton from "@/components/back-to-top-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Victoria Phantom Spares",
  description: "Quality spare parts for your vehicles",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <SidebarProvider>
                <div className="flex min-h-screen flex-col w-full">
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <WhatsAppButton />
                <BackToTopButton />
                <Toaster />
              </SidebarProvider>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

