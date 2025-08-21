"use client"

import { useState, useEffect, useCallback, memo } from "react"
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
import { useAuthContext } from "@/contexts/AuthContext"
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

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  name: string;
  isActive: boolean;
  isSidebarOpen: boolean;
}

// Memoized navigation item component to prevent unnecessary re-renders
const NavItem = memo(({ href, icon, name, isActive, isSidebarOpen }: NavItemProps) => (
  <Link
    href={href}
    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 ${
      isActive ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
    } ${!isSidebarOpen ? 'justify-center' : ''}`}
  >
    {icon}
    {isSidebarOpen && <span>{name}</span>}
  </Link>
));

NavItem.displayName = 'NavItem';

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, loading, checkAuth, logout, user } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const { toast } = useToast()
  
  // Get current page for breadcrumbs
  const getPageTitle = useCallback(() => {
    if (pathname === '/admin') return 'Dashboard';
    const path = pathname.split('/').filter(Boolean);
    if (path.length >= 2) {
      const pageName = path[1];
      return pageName.charAt(0).toUpperCase() + pageName.slice(1);
    }
    return 'Dashboard';
  }, [pathname]);
  
  // Check if current page might need a filter sidebar
  const mightHaveFilterSidebar = pathname.includes('/products') || 
                               pathname.includes('/categories') || 
                               pathname.includes('/users') ||
                               pathname.includes('/orders')

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.replace(`/auth/login?redirect=/admin`)
    }
  }, [isAuthenticated, user, loading, router])

  // Store current path in localStorage for navigation persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('previousPath', window.location.pathname);
    }
  }, []);

  // Debounced window resize handler with useCallback
  const handleResize = useCallback(() => {
    setIsResizing(true);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
    setIsResizing(false);
  }, [setIsResizing, setIsSidebarOpen]);

  useEffect(() => {
    // Set initial state
    handleResize();

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout | null = null;
    const debouncedResize = () => {
      setIsResizing(true);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        handleResize();
      }, 150); // 150ms debounce
    };

    // Add event listener
    window.addEventListener('resize', debouncedResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [handleResize]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // Memoize navigation items to prevent unnecessary re-renders
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
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Auth check
  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

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
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-1">
                <div>
                  <p className="font-medium">{user?.username}</p>
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

              <Separator />

              <nav className="space-y-1 px-2">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    name={item.name}
                    isActive={pathname === item.href}
                    isSidebarOpen={true}
                  />
                ))}
              </nav>

              <Separator />

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

          <Separator />

          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                name={item.name}
                isActive={pathname === item.href}
                isSidebarOpen={isSidebarOpen}
              />
            ))}
          </nav>

          <Separator />

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
