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
  const { isAuthenticated, isAdmin, loading, checkAuth } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
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
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
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
    <div className="flex min-h-screen mt-20 pt-12 md:pt-6 flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar - Always visible */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* Admin Panel Title with Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 -ml-2"
                disabled={isResizing}
              >
                <Menu className="h-5 w-5" />
                <span className="font-bold text-xl">Admin Panel</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link 
                    href={item.href} 
                    className="flex items-center gap-2 w-full cursor-pointer"
                    prefetch={false}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link 
                  href="/" 
                  className="flex items-center gap-2 w-full cursor-pointer"
                  prefetch={false}
                >
                  <Home className="h-5 w-5" />
                  <span>Back to Site</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-500" 
                onClick={logout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{getPageTitle()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Filter Menu - Only visible on pages that might have filters */}
          {mightHaveFilterSidebar && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  disabled={isResizing}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2" id="filter-dropdown-content">
                  {/* Filter content will be injected here by the page components */}
                  <p className="text-sm text-muted-foreground">Filter options for this page will appear here.</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* User Info */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                disabled={isResizing}
              >
                <div className="h-8 w-8 rounded-full bg-primary text-center leading-8 text-primary-foreground">
                  {user?.name?.charAt(0)}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
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
                className="text-red-500" 
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
        {/* Main Sidebar - Only visible on desktop */}
        <motion.aside
          className={`hidden lg:block lg:w-64 overflow-y-auto bg-white pt-6 shadow-lg dark:bg-gray-800 ${isSidebarOpen ? "lg:w-64" : "lg:w-20"}`}
          initial={false}
        >
          <div className="px-4">
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <ChevronDown
                className={`h-5 w-5 transition-transform ${isSidebarOpen ? "" : "rotate-180"}`}
              />
            </Button>
          </div>

          <Separator className="my-4" />

          <nav className="space-y-2 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
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
              className={`w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300 ${!isSidebarOpen ? "px-0" : ""}`}
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </motion.aside>

        {/* Secondary Filter Sidebar - Only visible on desktop */}
        {mightHaveFilterSidebar && (
          <aside className="hidden md:block md:w-64 overflow-y-auto bg-white pt-6 border-l dark:bg-gray-800 dark:border-gray-700">
            <div className="px-4">
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>
            
            <Separator className="my-4" />
            
            <div className="px-4">
              {/* This is a placeholder for the filter content */}
              {/* The actual filter content will be provided by the page components */}
              <div id="desktop-filter-sidebar-content" className="space-y-4">
                {/* Filter content will be injected here by the page components */}
                <p className="text-sm text-muted-foreground">Filter options for this page will appear here.</p>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 pt-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Page content */}
            <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
