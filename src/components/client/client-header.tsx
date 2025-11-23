"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ShoppingCart, LogOut, Menu, X, Search, User, ChevronDown, Package, Home, ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

interface ClientHeaderProps {
  onCartOpen: () => void
}

export default function ClientHeader({ onCartOpen }: ClientHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [cartCount, setCartCount] = useState<number>(0)
  const router = useRouter()
  const profileMenuRef = useRef<HTMLDivElement>(null)

  const getCartLength = async () => {
    try {
      const res = await fetch("api/cart/length")
      const data = await res.json()
      setCartCount(data.data)
    }
    catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getCartLength()
  }, [])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [profileMenuOpen])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen || searchDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [drawerOpen, searchDrawerOpen])

  const handleLogout = () => {
    signOut({
      redirect: true,
      callbackUrl: "/"
    })
  }

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  const toggleSearchDrawer = () => {
    setSearchDrawerOpen(!searchDrawerOpen)
  }

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/product?search=${encodeURIComponent(searchQuery.trim())}`)
      setDrawerOpen(false)
      setSearchDrawerOpen(false)
    }
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    setProfileMenuOpen(false)
    setDrawerOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/home" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                E
              </div>
              <span className="text-xl sm:text-2xl font-bold text-foreground">EcoStore</span>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <div className="relative group">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-14 py-3 bg-muted/30 border border-border/50 rounded-full text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-background/80 transition-all shadow-sm"
                />
                <button
                  onClick={() => handleSearch()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                  aria-label="Search"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Search Button */}
              <button
                onClick={toggleSearchDrawer}
                className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Search"
              >
                <Search size={20} className="text-foreground" />
              </button>

              {/* Cart Button */}
              <button
                onClick={onCartOpen}
                className="relative p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart size={20} className="text-foreground" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Desktop Profile Menu */}
              <div className="hidden md:block relative" ref={profileMenuRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-all duration-200"
                  aria-label="Profile menu"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center transition-colors duration-200">
                    <User size={18} className="text-primary" />
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-muted-foreground transition-transform duration-300 ease-out ${profileMenuOpen ? 'rotate-180' : 'rotate-0'}`} 
                  />
                </button>

                {/* Profile Dropdown */}
                <div 
                  className={`absolute right-0 mt-2 w-56 bg-background border border-border rounded-xl shadow-lg overflow-hidden transition-all duration-200 origin-top-right ${
                    profileMenuOpen 
                      ? 'opacity-100 scale-100 pointer-events-auto' 
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  <div className="py-2">
                    <button
                      onClick={() => handleNavigation('/home')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-all duration-200"
                    >
                      <Home size={18} className="text-muted-foreground transition-colors duration-200" />
                      <span className="font-medium">Home</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('/product')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-all duration-200"
                    >
                      <ShoppingBag size={18} className="text-muted-foreground transition-colors duration-200" />
                      <span className="font-medium">Products</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('/orders')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-all duration-200"
                    >
                      <Package size={18} className="text-muted-foreground transition-colors duration-200" />
                      <span className="font-medium">Orders</span>
                    </button>
                    <div className="my-1 border-t border-border"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-all duration-200"
                    >
                      <LogOut size={18} className="transition-colors duration-200" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleDrawer}
                className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${
          searchDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSearchDrawer}
      />

      {/* Mobile Search Drawer */}
      <div 
        className={`fixed top-0 left-0 right-0 bottom-0 bg-background z-50 md:hidden transition-transform duration-300 ease-out overflow-y-auto ${
          searchDrawerOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="min-h-full flex flex-col">
          {/* Search Header */}
          <div className="sticky top-0 bg-background border-b border-border">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={toggleSearchDrawer}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                    E
                  </div>
                  <span className="text-xl font-bold text-foreground">EcoStore</span>
                </div>
              </div>

              <div className="relative group">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                  placeholder="Search products..."
                  autoFocus
                  className="w-full pl-12 pr-4 py-3.5 bg-muted/30 border border-border/50 rounded-xl text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-background/80 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Search Content */}
          <div className="flex-1 container mx-auto px-4 py-6">
            {/* Recent Searches */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Recent searches
              </h3>
              <div className="space-y-2">
                {['Laptop Gaming', 'Mechanical Keyboard', 'Wireless Mouse'].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(item)
                      router.push(`/product?search=${encodeURIComponent(item)}`)
                      setSearchDrawerOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Search size={18} className="text-muted-foreground" />
                      <span className="text-foreground">{item}</span>
                    </div>
                    <X size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Searches */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Trending searches
              </h3>
              <div className="space-y-2">
                {['iPhone 15', 'PlayStation 5', 'AirPods Pro', 'MacBook Air', 'Samsung Galaxy', 'Nintendo Switch'].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(item)
                      router.push(`/product?search=${encodeURIComponent(item)}`)
                      setSearchDrawerOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg transition-colors text-left"
                  >
                    <div className="text-primary">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-foreground">{item}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleDrawer}
      />

      {/* Mobile Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l border-border z-50 md:hidden shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                E
              </div>
              <span className="text-xl font-bold text-foreground">Menu</span>
            </div>
            <button
              onClick={toggleDrawer}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Navigation Links */}
              <div className="space-y-2">
                <button
                  onClick={() => handleNavigation('/home')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-all duration-200 font-medium"
                >
                  <Home size={20} className="text-primary" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => handleNavigation('/product')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-all duration-200 font-medium"
                >
                  <ShoppingBag size={20} className="text-primary" />
                  <span>Products</span>
                </button>

                <button
                  onClick={() => handleNavigation('/orders')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-all duration-200 font-medium"
                >
                  <Package size={20} className="text-primary" />
                  <span>Orders</span>
                </button>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-border">
            <button
              onClick={() => {
                handleLogout()
                setDrawerOpen(false)
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-all duration-200 font-medium"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}