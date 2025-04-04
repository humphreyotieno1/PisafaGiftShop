import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <div className="w-full">
      <footer className="bg-primary text-primary-foreground w-full">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold">Pisafa Gifts Shop</h3>
              <p className="mt-4 max-w-xs text-sm text-primary-foreground/80">
                Your premier destination for exquisite jewelry and accessories. We offer handcrafted pieces that blend traditional elegance with modern design.
              </p>
              <div className="mt-6 flex space-x-4">
                <a
                  href="#"
                  className="rounded-full bg-primary-foreground/10 p-2 text-primary-foreground hover:bg-primary-foreground/20"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="rounded-full bg-primary-foreground/10 p-2 text-primary-foreground hover:bg-primary-foreground/20"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="rounded-full bg-primary-foreground/10 p-2 text-primary-foreground hover:bg-primary-foreground/20"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-primary-foreground/80 hover:text-primary-foreground">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold">Contact Us</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start">
                  <MapPin className="mr-2 h-5 w-5 shrink-0" />
                  <span className="text-sm text-primary-foreground/80">Equity Trading Centre</span>
                </li>
                <li className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 shrink-0" />
                  <a
                    href="tel:+254721728618"
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground"
                  >
                    +254 721 728 618
                  </a>
                </li>
                <li className="flex items-center">
                  <Mail className="mr-2 h-5 w-5 shrink-0" />
                  <a
                    href="mailto:info@pisafagiftsshop.com"
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground"
                  >
                    info@pisafagiftsshop.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold">Newsletter</h3>
              <p className="mt-4 text-sm text-primary-foreground/80">
                Subscribe to receive updates on new collections, exclusive offers, and jewelry care tips.
              </p>
              <form className="mt-4 flex">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="h-10 w-full rounded-l-md border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground/30 focus:ring-primary-foreground/30"
                  required
                />
                <Button
                  type="submit"
                  className="rounded-l-none bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-12 border-t border-primary-foreground/20 pt-8 text-center">
            <p className="text-sm text-primary-foreground/70">
              &copy; {new Date().getFullYear()} Pisafa Gifts Shop. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

