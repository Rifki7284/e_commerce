"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ShoppingCart, LogOut, Menu, X, Search, User, ChevronDown, Package, Home, ShoppingBag, Gamepad2, Zap } from "lucide-react"
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
    router.push(`/product?search=${encodeURIComponent(searchQuery.trim())}`)
    setDrawerOpen(false)
    setSearchDrawerOpen(false)
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    setProfileMenuOpen(false)
    setDrawerOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur-md shadow-lg shadow-black/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/home" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
                <Gamepad2 size={20} />
              </div>
              <span className="text-xl sm:text-2xl font-black text-white bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
                GameKeys
              </span>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <div className="relative group">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-400"
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
                  placeholder="Search for games, software, gift cards..."
                  className="w-full pl-12 pr-14 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-800 transition-all"
                />
                <button
                  onClick={() => handleSearch()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 active:scale-95 transition-all shadow-lg shadow-blue-500/30"
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
                className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Search"
              >
                <Search size={20} className="text-slate-300" />
              </button>

              {/* Cart Button */}
              <button
                onClick={onCartOpen}
                className="relative p-2 hover:bg-slate-800 rounded-lg transition-all group"
                aria-label="Shopping cart"
              >
                <ShoppingCart size={20} className="text-slate-300 group-hover:text-white transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-linear-to-r from-red-500 to-pink-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Desktop Profile Menu */}
              <div className="hidden md:block relative" ref={profileMenuRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg transition-all duration-200 border border-transparent hover:border-slate-700"
                  aria-label="Profile menu"
                >
                  <div className="w-8 h-8 bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full flex items-center justify-center transition-all duration-200">
                    <User size={18} className="text-blue-400" />
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-300 ease-out ${profileMenuOpen ? 'rotate-180' : 'rotate-0'}`}
                  />
                </button>

                {/* Profile Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-56 bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden transition-all duration-200 origin-top-right ${
                    profileMenuOpen
                      ? 'opacity-100 scale-100 pointer-events-auto'
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  <div className="py-2">
                    <button
                      onClick={() => handleNavigation('/home')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <Home size={18} className="text-blue-400" />
                      <span className="font-medium">Home</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('/product')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <ShoppingBag size={18} className="text-purple-400" />
                      <span className="font-medium">Browse Games</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('/orders')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <Package size={18} className="text-green-400" />
                      <span className="font-medium">My Library</span>
                    </button>
                    <div className="my-1 border-t border-slate-700"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleDrawer}
                className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <Menu size={20} className="text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${
          searchDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSearchDrawer}
      />

      {/* Mobile Search Drawer */}
      <div
        className={`fixed top-0 left-0 right-0 bottom-0 bg-slate-900 z-50 md:hidden transition-transform duration-300 ease-out overflow-y-auto ${
          searchDrawerOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="min-h-full flex flex-col">
          {/* Search Header */}
          <div className="sticky top-0 bg-slate-900 border-b border-slate-700">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={toggleSearchDrawer}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Close search"
                >
                  <X size={20} className="text-slate-300" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-black">
                    <Gamepad2 size={18} />
                  </div>
                  <span className="text-xl font-black text-white">GameKeys</span>
                </div>
              </div>

              <div className="relative group">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-400"
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
                  placeholder="Search for games, software..."
                  autoFocus
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Search Content */}
          <div className="flex-1 container mx-auto px-4 py-6">
            {/* Trending Searches */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                Trending Now
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['Steam Wallet', 'GTA V', 'Cyberpunk 2077', 'Elden Ring', 'Red Dead 2', 'Minecraft'].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(item)
                      router.push(`/product?search=${encodeURIComponent(item)}`)
                      setSearchDrawerOpen(false)
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg transition-all text-left group"
                  >
                    <Gamepad2 size={16} className="text-blue-400 group-hover:text-blue-300" />
                    <span className="text-sm text-slate-300 group-hover:text-white font-medium">{item}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Categories */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Popular Categories
              </h3>
              <div className="space-y-2">
                {[
                  { name: 'Action Games', icon: '🎮' },
                  { name: 'RPG Games', icon: '⚔️' },
                  { name: 'Steam Keys', icon: '🔑' },
                  { name: 'Gift Cards', icon: '🎁' },
                  { name: 'Software', icon: '💻' },
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(item.name)
                      router.push(`/product?search=${encodeURIComponent(item.name)}`)
                      setSearchDrawerOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/30 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-all text-left group"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-slate-300 group-hover:text-white font-medium">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleDrawer}
      />

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-slate-900 border-l border-slate-700 z-50 md:hidden shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-black">
                <Gamepad2 size={18} />
              </div>
              <span className="text-xl font-bold text-white">Menu</span>
            </div>
            <button
              onClick={toggleDrawer}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X size={20} className="text-slate-300" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Navigation Links */}
              <div className="space-y-2">
                <button
                  onClick={() => handleNavigation('/home')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium border border-transparent hover:border-slate-700"
                >
                  <Home size={20} className="text-blue-400" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => handleNavigation('/product')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium border border-transparent hover:border-slate-700"
                >
                  <ShoppingBag size={20} className="text-purple-400" />
                  <span>Browse Games</span>
                </button>

                <button
                  onClick={() => handleNavigation('/orders')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 font-medium border border-transparent hover:border-slate-700"
                >
                  <Package size={20} className="text-green-400" />
                  <span>My Library</span>
                </button>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/50">
            <button
              onClick={() => {
                handleLogout()
                setDrawerOpen(false)
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all duration-200 font-medium"
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