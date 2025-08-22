'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCartContext } from '@/contexts/CartContext';
import { useWishlistContext } from '@/contexts/WishlistContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, Heart, User, LogOut, Settings, Package, Search, Menu, X, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getInitials } from '@/utils/helpers';

// Define User interface
interface User {
  username?: string;
  full_name?: string;
  email?: string;
  role?: string;
}

// Toast hook provides { toast } API

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuthContext();
  const { cartCount } = useCartContext();
  const { wishlistCount } = useWishlistContext();
  const { toast } = useToast();
  const router = useRouter();
  const navRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        navRef.current &&
        !navRef.current.contains(event.target as Node) &&
        !menuButtonRef.current?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMenuOpen]);

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const result = await logout();
      if (result.success) {
        toast({ title: 'Logged out successfully' });
        setIsMenuOpen(false);
      } else {
        toast({ title: 'Logout failed', description: result.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Logout failed', description: 'An unexpected error occurred', variant: 'destructive' });
    }
    finally {
      setIsLoggingOut(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 w-full" aria-label="Main navigation">
      {/* Top banner */}
      <div className="w-full bg-gray-900 text-white text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
          <span>Elegance | Style | Luxury: Pisafa Gifts Shop</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center hover:scale-105 transition-transform duration-200" aria-label="Pisafa Gift Shop Home">
              <img
                src="/pisafalogo.png"
                alt="Pisafa Gift Shop"
                className="h-8 w-auto"
                width={32}
                height={32}
              />
              <span className="ml-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                Pisafa
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blue-700 hover:scale-105 px-3 py-2 text-sm font-medium transition-all duration-200"
                aria-current={item.href === window.location.pathname ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side - Search, Cart, Wishlist, User, Mobile Menu Button */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 sm:flex transition-all duration-200"
              aria-label="Search products"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5 text-gray-700 hover:text-blue-600 hover:rotate-6 transition-all duration-200" />
            </Button>

            <Link href="/wishlist" className="relative" aria-label={`Wishlist with ${wishlistCount} items`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all duration-200"
              >
                <Heart className="h-5 w-5 text-gray-700 hover:text-blue-600 hover:rotate-6 transition-all duration-200" />
                {wishlistCount > 0 && (
                  <Badge variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white hover:scale-110 transition-transform duration-200"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link href="/cart" className="relative" aria-label={`Cart with ${cartCount} items`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all duration-200"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700 hover:text-blue-600 hover:rotate-6 transition-all duration-200" />
                {cartCount > 0 && (
                  <Badge variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white hover:scale-110 transition-transform duration-200"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all duration-200"
                    aria-label="User menu"
                  >
                    <Avatar className="h-8 w-8">
                      {/* AvatarImage can be added when user image is available */}
                      <AvatarFallback>
                        {getInitials(user?.full_name || user?.username || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border rounded-md shadow-lg" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.full_name || user?.username}
                      </p>
                      <p className="text-xs leading-none text-gray-500">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="border-t border-gray-200" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center px-3 py-2 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center px-3 py-2 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center px-3 py-2 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="border-t border-gray-200" />
                  <DropdownMenuItem disabled={isLoggingOut} onClick={handleLogout} className="flex items-center px-3 py-2 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                    {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                    {isLoggingOut ? 'Logging out...' : 'Log out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-3 rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 flex items-center gap-1 transition-all duration-200"
                  >
                    <LogIn className="h-5 w-5 text-gray-700 hover:text-blue-600 hover:rotate-6 transition-all duration-200" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="sm"
                    className="h-10 px-3 rounded-full bg-primary hover:bg-primary/80 hover:scale-105 hover:shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 flex items-center gap-1 transition-all duration-200"
                  >
                    <UserPlus className="h-5 w-5 hover:rotate-6 transition-all duration-200" />
                    <span>Sign Up</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-600 transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700 hover:text-blue-600 hover:rotate-6 transition-all duration-200" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 hover:text-blue-600 hover:rotate-6 transition-all duration-200" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!searchQuery.trim()}>
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={navRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex gap-2 px-3 py-2">
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={!searchQuery.trim()}>
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={item.href === window.location.pathname ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile User Menu */}
              {isAuthenticated ? (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(user?.full_name || user?.username || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.full_name || user?.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </Link>
                  
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      Admin Panel
                    </Link>
                  )}
                  
                  <Link
                    href="/orders"
                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package className="h-5 w-5" />
                    Orders
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-left text-gray-700 hover:text-red-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
                    {isLoggingOut ? 'Logging out...' : 'Log out'}
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="h-5 w-5 hover:text-blue-600 hover:rotate-6 transition-all duration-200" />
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserPlus className="h-5 w-5 hover:text-blue-600 hover:rotate-6 transition-all duration-200" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}