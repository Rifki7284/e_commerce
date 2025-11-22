"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart, LogOut, Menu, X, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

interface ClientHeaderProps {
  onCartOpen: () => void
}

export default function ClientHeader({ onCartOpen }: ClientHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [cartCount, setCartCount] = useState<number>(0)
  const router = useRouter()
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
  const handleLogout = () => {
    signOut({
      redirect: true,
      callbackUrl: "/"
    })
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/product?search=${encodeURIComponent(searchQuery.trim())}`)
      setMobileMenuOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              E
            </div>
            <span className="text-2xl font-bold text-foreground">EcoStore</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/home"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/product"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Products
            </Link>
            <Link
              href="/transaction"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Orders
            </Link>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative w-80">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-2.5 bg-muted/50 border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all hover:scale-105"
                aria-label="Search"
              >
                <Search size={16} />
              </button>
            </form>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
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

            {/* Desktop Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-3">
              <Link
                href="/home"
                className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/product"
                className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-4 py-2">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all active:scale-95"
                    aria-label="Search"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </form>

              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors font-medium"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}