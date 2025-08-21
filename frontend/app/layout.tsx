import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { CartProvider } from "@/contexts/CartContext"
import { WishlistProvider } from "@/contexts/WishlistContext"
import { ToastProvider as UiToastProvider } from "@/components/ui/use-toast"
import { ToastProvider as LegacyToastProvider } from "@/contexts/ToastContext"
import AppChrome from "@/components/AppChrome"
import WhatsAppButton from "@/components/whatsapp-button"
import BackToTopButton from "@/components/back-to-top-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Pisafa Gifts Shop",
  description: "Elegance that Shines, Beauty that Lasts",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth overflow-x-hidden" suppressHydrationWarning>
      <body className={`${inter.className} overflow-x-hidden`}>
        <AuthProvider>
          <CartProvider>
            <UiToastProvider>
              <LegacyToastProvider>
                <WishlistProvider>
                  <AppChrome>
                    {children}
                  </AppChrome>
                  <WhatsAppButton />
                  <BackToTopButton />
                  <Toaster />
                </WishlistProvider>
              </LegacyToastProvider>
            </UiToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

