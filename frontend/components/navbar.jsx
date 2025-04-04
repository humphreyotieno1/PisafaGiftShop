"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, ShoppingCart, Search, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { Badge } from "@/components/ui/badge"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const CATEGORIES = [
  "Pendant", 
  "Earring", 
  "Necklace", 
  "Ring",
  "Bracelet",
  "Anklet",
  "Bangle",
  "Garment Accessories",
  "Watches",
]

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "About Us", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { cartItems } = useCart()
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const mobileMenuRef = useRef(null)
  
  // Listen for scroll events to apply shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsMobileSearchOpen(false)
  }, [pathname])

  // Handle touch swipe to close menu
  useEffect(() => {
    const handleTouchStart = (e) => {
      const startX = e.touches[0].clientX
      
      const handleTouchMove = (e) => {
        const currentX = e.touches[0].clientX
        const diff = currentX - startX
        
        // If swiping left, close the menu
        if (diff < -50) {
          setIsMobileMenuOpen(false)
        }
      }
      
      document.addEventListener('touchmove', handleTouchMove)
      
      document.addEventListener('touchend', () => {
        document.removeEventListener('touchmove', handleTouchMove)
      }, { once: true })
    }
    
    const menuElement = mobileMenuRef.current
    if (menuElement && isMobileMenuOpen) {
      menuElement.addEventListener('touchstart', handleTouchStart)
      
      return () => {
        menuElement.removeEventListener('touchstart', handleTouchStart)
      }
    }
  }, [isMobileMenuOpen, mobileMenuRef])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    setIsMobileSearchOpen(false)
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleNavigation = (href) => {
    setIsMobileMenuOpen(false)
    router.push(href)
  }

  const totalCartItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0)

  return (
    <div className="fixed z-50 w-full">
    <header className="fixed top-0 z-50 w-full">
      {/* Announcement Banner */}
      <div className="bg-primary px-4 py-2 text-center text-xs sm:text-sm font-medium text-primary-foreground">
        Elegance | Style | Luxury: <span className="font-bold">PISAFA GIFTS SHOP</span>
      </div>

      {/* Main Navigation */}
      <nav 
        className={`border-b bg-background transition-all duration-200 ${
          isScrolled ? "shadow-md" : ""
        }`}
        aria-label="Main navigation"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* Left Section: Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden" 
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">{isMobileMenuOpen ? "Close menu" : "Menu"}</span>
            </Button>

            {/* Mobile Menu Panel */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-hidden="true"
                  />
                  
                  {/* Menu Panel */}
                  <motion.div
                    ref={mobileMenuRef}
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed left-0 top-0 bottom-0 w-[300px] bg-background border-r z-50 overflow-auto"
                  >
                    <div className="flex h-full flex-col">
                      {/* Mobile Menu Header */}
                      <div className="border-b p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Link href="/">
                            <Image
                              src="/pisafalogo.png"
                              alt="Pisafa Gifts Shop Logo"
                              width={40}
                              height={40}
                              className="h-10 w-auto"
                              priority
                            />
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-label="Close menu"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                        <form onSubmit={handleSearch} className="relative">
                          <Input
                            type="search"
                            placeholder="Search products..."
                            className="w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0">
                            <Search className="h-4 w-4" />
                            <span className="sr-only">Search</span>
                          </Button>
                        </form>
                      </div>
                      
                      {/* Mobile Menu Links */}
                      <div className="flex-1 overflow-auto py-4">
                        <nav className="flex flex-col space-y-1 px-4">
                          {navLinks.map((link) => (
                            <motion.div
                              key={link.name}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="ghost"
                                className={`w-full justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                  pathname === link.href
                                    ? "bg-primary/10 text-primary"
                                    : "text-foreground hover:bg-muted"
                                }`}
                                onClick={() => handleNavigation(link.href)}
                              >
                                {link.name}
                              </Button>
                            </motion.div>
                          ))}
                        </nav>
                        
                        {/* Categories Section */}
                        <div className="mt-6 px-4">
                          <div className="rounded-md bg-muted p-3">
                            <h3 className="mb-2 text-sm font-medium">Categories</h3>
                            <div className="space-y-1">
                              {CATEGORIES.map((category) => (
                                <motion.div
                                  key={category}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start rounded-md px-2 py-1 text-sm transition-colors hover:bg-background"
                                    onClick={() => handleNavigation(`/shop?category=${category.toLowerCase().replace(/\s+/g, "-")}`)}
                                  >
                                    {category}
                                  </Button>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile Menu Footer */}
                      <div className="border-t p-4">
                        {user ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium truncate max-w-[200px]">
                                {user.name || user.email}
                              </span>
                            </div>
                            <Button variant="outline" className="w-full mt-2" onClick={() => {
                              setIsMobileMenuOpen(false)
                              logout()
                            }}>
                              Log Out
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <Button 
                              className="w-full"
                              onClick={() => handleNavigation("/auth/login")}
                            >
                              Sign In
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleNavigation("/auth/register")}
                            >
                              Register
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/pisafalogo.png"
                alt="Pisafa Gifts Shop Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Middle Section: Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href 
                    ? "text-primary after:absolute after:bottom-[-1.5rem] after:left-0 after:h-[2px] after:w-full after:bg-primary" 
                    : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section: Search, Cart, and User */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-[200px] lg:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full"
                disabled={!searchQuery.trim()}
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>

            {/* Mobile Search Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              aria-label={isMobileSearchOpen ? "Close search" : "Search"}
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">{isMobileSearchOpen ? "Close search" : "Search"}</span>
            </Button>

            {/* Mobile Search Panel */}
            <AnimatePresence>
              {isMobileSearchOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileSearchOpen(false)}
                    aria-hidden="true"
                  />
                  
                  {/* Search Panel */}
                  <motion.div
                    initial={{ y: "-100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed left-0 top-0 w-full h-[30vh] bg-background border-b z-50 md:hidden"
                  >
                    <div className="flex h-full flex-col justify-center px-4">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium">Search Products</h2>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setIsMobileSearchOpen(false)}
                          aria-label="Close search"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <form onSubmit={handleSearch} className="relative">
                        <Input
                          type="search"
                          placeholder="Search products..."
                          className="w-full"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                        />
                        <Button 
                          type="submit" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-full"
                          disabled={!searchQuery.trim()}
                        >
                          <Search className="h-4 w-4" />
                          <span className="sr-only">Search</span>
                        </Button>
                      </form>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Cart Link */}
            <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              className="relative"
              aria-label={`Shopping cart with ${totalCartItems} items`}
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {totalCartItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                  >
                    {totalCartItems > 99 ? "99+" : totalCartItems}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium truncate">{user.name || "User"}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="cursor-pointer">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex sm:items-center sm:gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/register" className="hidden md:inline-flex">Register</Link>
                </Button>
              </div>
            )}
            
            {/* Mobile-only Sign In Button for non-logged in users */}
            {!user && (
              <Button 
                variant="ghost" 
                size="icon" 
                asChild 
                className="sm:hidden"
                aria-label="Sign in"
              >
                <Link href="/auth/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
    </div>
  )
}