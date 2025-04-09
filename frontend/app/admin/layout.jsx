"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Home,
  SlidersHorizontal,
  ChevronRight,
  ShoppingCart,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

export default function AdminLayout({ children }) {
  const { isAuthenticated, isAdmin, loading, checkAuth, logout, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const { toast } = useToast()
  
  // Get current page for breadcrumbs
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    const path = pathname.split('/').filter(Boolean);
    if (path.length >= 2) {
      const pageName = path[1];
      return pageName.charAt(0).toUpperCase() + pageName.slice(1);
    }
    return 'Dashboard';
  }
  
  // Check if current page might need a filter sidebar
  const mightHaveFilterSidebar = pathname.includes('/products') || 
                               pathname.includes('/categories') || 
                               pathname.includes('/users') ||
                               pathname.includes('/orders')

  useEffect(() => {
    const verifySession = async () => {
      if (!loading) {
        try {
          // Check if we have a valid session
          const response = await fetch('/api/auth/me', {
            credentials: 'include',
          })

          if (!response.ok) {
            // If session is invalid, try to refresh
            const refreshResponse = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include',
            })

            if (!refreshResponse.ok) {
              throw new Error('Session expired')
            }
          }

          // Re-check authentication status
          await checkAuth()
        } catch (error) {
          toast({
            title: "Session Expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          })
          router.push("/auth/login")
        }
      }
    }

    verifySession()
  }, [loading])

  // Store current path in localStorage for navigation persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('previousPath', window.location.pathname);
    }
  }, []);

  // Debounced window resize handler
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      setIsResizing(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.innerWidth < 1024) {
          setIsSidebarOpen(false);
        } else {
          setIsSidebarOpen(true);
        }
        setIsResizing(false);
      }, 150); // 150ms debounce
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: <SlidersHorizontal className="h-5 w-5" />,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Left side - Logo and mobile menu button */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="Toggle menu"
          >
            {isMobileSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold hidden sm:inline-block">Pisafa Admin</span>
          </Link>
        </div>

        {/* Breadcrumbs - Only visible on desktop */}
        <div className="hidden md:flex items-center gap-1 text-sm">
          <Link 
            href="/admin" 
            className="text-muted-foreground hover:text-foreground"
          >
            Admin
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{getPageTitle()}</span>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-9 w-9 rounded-full"
                aria-label="User menu"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-1">
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link 
                  href="/" 
                  className="flex items-center gap-2 w-full cursor-pointer"
                  prefetch={false}
                >
                  <Home className="h-4 w-4" />
                  <span>Back to Site</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950" 
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar - Only visible on mobile */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50" 
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-hidden="true"
            />
            
            {/* Mobile Sidebar Content */}
            <motion.aside
              className="fixed inset-y-0 left-0 w-64 overflow-y-auto bg-white pt-6 shadow-lg dark:bg-gray-800"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold">Pisafa Admin</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <Separator className="my-4" />

              <nav className="space-y-1 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 ${
                      pathname === item.href ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>

              <Separator className="my-4" />

              {/* Logout Button */}
              <div className="px-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-2">Logout</span>
                </Button>
              </div>
            </motion.aside>
          </div>
        )}

        {/* Desktop Sidebar - Only visible on desktop */}
        <motion.aside
          className={`hidden lg:block overflow-y-auto bg-white pt-6 shadow-lg dark:bg-gray-800 transition-all duration-300 ${isSidebarOpen ? "lg:w-64" : "lg:w-20"}`}
          initial={false}
        >
          <div className="px-4">
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <ChevronDown
                className={`h-5 w-5 transition-transform ${isSidebarOpen ? "" : "rotate-180"}`}
              />
            </Button>
          </div>

          <Separator className="my-4" />

          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 ${
                  pathname === item.href ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                } ${!isSidebarOpen ? 'justify-center' : ''}`}
              >
                {item.icon}
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>

          <Separator className="my-4" />

          {/* Logout Button */}
          <div className="px-2">
            <Button
              variant="ghost"
              className={`w-full justify-${isSidebarOpen ? 'start' : 'center'} text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300`}
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
