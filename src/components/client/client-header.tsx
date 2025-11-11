"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Search, LogOut, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

interface ClientHeaderProps {
  cartCount: number
  onCartOpen: () => void
  user: any
}

export default function ClientHeader({ cartCount, onCartOpen, user }: ClientHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    signOut({
      redirect: true,
      callbackUrl: "/"   // atau route mana saja setelah logout
    })
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/client/home" className="text-2xl font-bold text-foreground flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            E
          </div>
          EcoStore
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/client/home" className="text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/client/products" className="text-foreground hover:text-primary transition-colors">
            Products
          </Link>
          <Link
            href="/client/search"
            className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
          >
            <Search size={18} />
            Search
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <button
            onClick={onCartOpen}
            className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={20} className="text-foreground" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Desktop Logout */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link href="/client/home" className="block text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/client/products" className="block text-foreground hover:text-primary transition-colors">
              Products
            </Link>
            <Link href="/client/search" className="block text-foreground hover:text-primary transition-colors">
              Search
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left text-foreground hover:text-primary transition-colors py-2"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
