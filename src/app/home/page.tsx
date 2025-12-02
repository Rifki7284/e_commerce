"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, ShoppingCart, Loader2, Star, Download, Key, Zap, TrendingUp, Award, Shield } from "lucide-react"
import Link from "next/link"
import ClientHeader from "@/components/client/client-header"
import ShoppingCartModal from "@/components/store/shopping-cart"
import formatPrice from "@/lib/formatPrice"

export interface Product {
  id: number
  name: string
  price: number
  slug: string
  description: string
  stock: number
  categories: Category
  images: ProductImage[]
  reviews?: Review[]
}

interface Category {
  name: string
  slug: string
}

interface ProductImage {
  url: string
}

export interface ReviewUser {
  id: number
  name: string
  email: string
}

export interface Review {
  id: number
  star: number
  review: string
  productId: number
  userId: number
  user: ReviewUser
}

// Loading Skeleton Component
const ProductSkeleton = () => (
  <div className="group bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden animate-pulse">
    <div className="relative aspect-video bg-slate-700"></div>
    <div className="p-4">
      <div className="h-3 bg-slate-700 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-slate-700 rounded w-2/3 mb-3"></div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-4 bg-slate-700 rounded w-24"></div>
      </div>
      <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
      <div className="h-10 bg-slate-700 rounded w-full"></div>
    </div>
  </div>
)

export default function ClientHomePage() {
  const [user, setUser] = useState<any>(null)
  const [cart, setCart] = useState<any[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [perPage, setPerPage] = useState<number>(8)
  const [totalPage, setTotalPage] = useState<number>()
  const [product, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const router = useRouter()

  const getProduct = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products?page=${currentPage}&perPage=${perPage}`)
      const data = await res.json()
      setProducts(data.product || [])
      setTotalPage(Math.ceil(data.count / Number(perPage)))
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWishlist = (productId: string) => {
    const updated = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId]
    setWishlist(updated)
    localStorage.setItem("wishlist", JSON.stringify(updated))
  }

  const addToCart = async (product: Product) => {
    setAddingToCart(product.id)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      })

      if (res.status === 401) {
        alert("Silakan login terlebih dahulu untuk menambahkan ke keranjang.")
        return
      }

      if (!res.ok) {
        const err = await res.json()
        console.error("Gagal menambahkan ke keranjang:", err)
        alert("Terjadi kesalahan saat menambahkan ke keranjang.")
        return
      }

      const data = await res.json()
      console.log("✅ Added to cart:", data)
    } catch (error) {
      console.error("❌ Error adding to cart:", error)
      alert("Terjadi kesalahan saat menambahkan ke keranjang.")
    } finally {
      setAddingToCart(null)
    }
  }

  useEffect(() => {
    getProduct()
  }, [currentPage])

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <ClientHeader onCartOpen={() => setCartOpen(true)} />

      {/* Hero Banner with Promotion */}
      <section className="relative overflow-hidden border-b border-slate-700">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/30 via-purple-900/30 to-slate-900/30"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full mb-6">
              <Zap size={16} className="text-orange-400" />
              <span className="text-orange-300 text-sm font-bold uppercase tracking-wide">Flash Sale - Up to 70% Off</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              <span className="bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Digital Games
              </span>
              <br />
              Instant Delivery
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Get your favorite PC games, Steam keys, gift cards, and software instantly. 
              <span className="text-blue-400 font-semibold"> Safe, fast, and affordable.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/product"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105"
              >
                <ShoppingCart size={20} />
                Browse Games
              </Link>
              <Link
                href="/product?category=gift-cards"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/80 backdrop-blur-sm text-white border border-slate-700 rounded-xl font-bold hover:bg-slate-700 transition-all"
              >
                <Key size={20} />
                Gift Cards
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-slate-700 bg-slate-900/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Download, text: "Instant Delivery", subtext: "Get keys immediately" },
              { icon: Shield, text: "100% Secure", subtext: "Safe transactions" },
              { icon: Award, text: "Official Keys", subtext: "Authorized reseller" },
              { icon: TrendingUp, text: "Best Prices", subtext: "Guaranteed lowest" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-blue-500/30">
                  <item.icon size={24} className="text-blue-400" />
                </div>
                <p className="font-bold text-white text-sm mb-1">{item.text}</p>
                <p className="text-xs text-slate-400">{item.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h2 className="text-4xl font-black text-white">Featured Games</h2>
          </div>
          <p className="text-slate-400 text-lg">Handpicked digital products just for you</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : product.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Products Found</h3>
            <p className="text-slate-400">Check back later for amazing deals!</p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.map((item) => (
              <div
                key={item.id}
                className="group bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <img
                    src={item.images?.[0]?.url || "/placeholder.svg"}
                    alt={item.name}
                    onClick={() => router.push(`/product/${item.slug}`)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <button
                    onClick={() => toggleWishlist(item.id.toString())}
                    className="absolute top-3 right-3 p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg hover:bg-slate-800 transition-colors border border-slate-700"
                  >
                    <Heart
                      size={18}
                      className={
                        wishlist.includes(item.id.toString())
                          ? "fill-red-500 text-red-500"
                          : "text-slate-400"
                      }
                    />
                  </button>

                  {/* Digital Badge */}
                  <div className="absolute top-3 left-3 bg-blue-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border border-blue-400/30">
                    <Key size={12} />
                    Digital
                  </div>

                  {item.stock < 10 && item.stock > 0 && (
                    <div className="absolute bottom-3 left-3 bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-semibold border border-orange-400/30">
                      Only {item.stock} left
                    </div>
                  )}

                  {item.stock === 0 && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-slate-300 font-bold text-lg">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-xs text-blue-400 uppercase tracking-wide mb-2 font-semibold">
                    {item.categories?.name || "Digital Product"}
                  </p>
                  <h3 
                    className="font-bold text-base text-white mb-3 line-clamp-2 cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => router.push(`/product/${item.slug}`)}
                  >
                    {item.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => {
                        const reviews = item.reviews ?? []
                        const avgStar =
                          reviews.length > 0
                            ? reviews.reduce((acc, r) => acc + r.star, 0) / reviews.length
                            : 0
                        const filled = i < Math.round(avgStar)

                        return (
                          <Star
                            key={i}
                            size={14}
                            className={
                              filled
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-600"
                            }
                          />
                        )
                      })}
                    </div>
                    <span className="text-xs text-slate-400">
                      ({item.reviews?.length || 0})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-white">
                      {formatPrice(item.price)}
                    </span>
                    <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                      <Download size={12} />
                      Instant
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addToCart(item)}
                    disabled={item.stock === 0 || addingToCart === item.id}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 shadow-lg hover:shadow-blue-500/50"
                  >
                    {addingToCart === item.id ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} />
                        {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {product.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/product"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold transition-all"
            >
              View All Products
              <TrendingUp size={20} />
            </Link>
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="bg-slate-900/50 border-y border-slate-700 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
              <h2 className="text-4xl font-black text-white">Popular Categories</h2>
            </div>
            <p className="text-slate-400 text-lg">Explore our digital product collections</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                name: "PC Games", 
                icon: "🎮", 
                gradient: "from-blue-500/20 to-cyan-500/20",
                border: "border-blue-500/30",
                hover: "hover:border-blue-500/60"
              },
              { 
                name: "Gift Cards", 
                icon: "🎁", 
                gradient: "from-purple-500/20 to-pink-500/20",
                border: "border-purple-500/30",
                hover: "hover:border-purple-500/60"
              },
              { 
                name: "Software", 
                icon: "💻", 
                gradient: "from-orange-500/20 to-red-500/20",
                border: "border-orange-500/30",
                hover: "hover:border-orange-500/60"
              },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/product?category=${category.name.toLowerCase()}`}
                className={`bg-linear-to-br ${category.gradient} backdrop-blur-sm border ${category.border} ${category.hover} rounded-xl p-8 text-center hover:shadow-xl transition-all group cursor-pointer`}
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                <p className="text-slate-400 text-sm">Browse collection →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-4">Why Choose GameKeys?</h2>
          <p className="text-slate-400 text-lg">Your trusted digital marketplace</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Download,
              title: "Instant Delivery",
              description: "Get your digital keys within seconds of purchase"
            },
            {
              icon: Shield,
              title: "100% Secure",
              description: "Encrypted transactions and verified payment methods"
            },
            {
              icon: Award,
              title: "Official Products",
              description: "All keys are sourced from authorized distributors"
            },
            {
              icon: TrendingUp,
              title: "Best Prices",
              description: "Competitive pricing with regular discounts and deals"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all group"
            >
              <div className="w-14 h-14 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-blue-500/30">
                <feature.icon size={28} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {cartOpen && (
        <ShoppingCartModal
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  )
}