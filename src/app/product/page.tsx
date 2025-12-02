"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ShoppingCart, Heart, Star, Loader2, Filter, X, ChevronDown, Download, Key, Gamepad2, Monitor } from "lucide-react"
import ClientHeader from "@/components/client/client-header"
import ShoppingCartModal from "@/components/store/shopping-cart"
import formatPrice from "@/lib/formatPrice"
import { Button } from "@/components/ui/button"

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
  id: number
  name: string
  slug: string
  iconName: string
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

// Skeleton Card Component
function ProductSkeleton() {
  return (
    <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden animate-pulse border border-slate-700">
      <div className="relative aspect-video bg-slate-700" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-700 rounded w-1/2" />
        <div className="h-10 bg-slate-700 rounded" />
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [priceRange, setPriceRange] = useState([0, 25000000])
  const [product, setProducts] = useState<Product[]>([])
  const searchParams = useSearchParams()
  const search = searchParams.get('search')
  const router = useRouter()
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  const [category, setCategory] = useState<Category[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [perPage, setPerPage] = useState<number>(12)
  const [totalPage, setTotalPage] = useState<number>()
  const [loadProduct, setLoadProduct] = useState<boolean>(true)
  const [filterOpen, setFilterOpen] = useState(false)

  const getCategory = async () => {
    const res = await fetch(`/api/category`)
    const data = await res.json()
    setCategory(data.category)
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

  const getProduct = async () => {
    try {
      setLoadProduct(true)
      const res = await fetch(
        `/api/products?page=${currentPage}&perPage=${perPage}&search=${search == null ? "" : search}&category=${selectedCategory}&maxPrice=${priceRange[1]}&minPrice=${priceRange[0]}&sort=${sortBy}`
      )
      const data = await res.json()
      setProducts(data.product || [])
      setTotalPage(Math.ceil(data.count / Number(perPage)))
      setLoadProduct(false)
    } catch (error) {
      console.error("Error fetching products:", error)
      setLoadProduct(false)
    }
  }

  useEffect(() => {
    getProduct()
    getCategory()
  }, [])

  const FilterContent = () => (
    <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <Filter size={18} />
          Filters
        </h3>
        <button
          onClick={() => setFilterOpen(false)}
          className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X size={20} className="text-slate-300" />
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Gamepad2 size={16} />
          Category
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="category"
              value=""
              checked={selectedCategory === ""}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">All Products</span>
          </label>
          {category?.length > 0 ? (
            category.map((item, index) => (
              <label key={index} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value={item.id.toString()}
                  checked={selectedCategory === item.id.toString()}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors capitalize">{item.name}</span>
              </label>
            ))
          ) : null}
        </div>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-300 mb-3">Price Range</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Min Price</label>
            <input
              type="number"
              min="0"
              max="25000000"
              defaultValue={priceRange[0]}
              onBlur={(e) => {
                const value = e.target.value
                setPriceRange([value === "" ? 0 : Number(value), priceRange[1]])
              }}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Max Price</label>
            <input
              type="number"
              min="0"
              max="25000000"
              defaultValue={priceRange[1]}
              onBlur={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value) || 25000000])}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="25000000"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
        </p>
      </div>

      {/* Sort */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-300 mb-3">Sort By</p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      <Button 
        className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold" 
        onClick={() => getProduct()}
      > 
        Apply Filters
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <ClientHeader onCartOpen={() => setCartOpen(true)} />

      {/* Hero Header */}
      <div className="relative bg-linear-to-r from-blue-900/50 via-purple-900/50 to-blue-900/50 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 px-4 py-2 rounded-full mb-4">
            <Download size={16} className="text-blue-400" />
            <p className="text-xs md:text-sm font-semibold text-blue-300 uppercase tracking-wider">
              Instant Digital Delivery
            </p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-4 bg-linear-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text">
            Game Keys & Digital Products
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
            Browse thousands of digital games, software, and gift cards
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-10">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setFilterOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-linear-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all"
        >
          <Filter size={24} />
        </button>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24">
              <FilterContent />
            </div>
          </div>

          {/* Mobile Filter Overlay */}
          {filterOpen && (
            <>
              <div
                className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={() => setFilterOpen(false)}
              />
              <div
                className="lg:hidden fixed inset-y-0 right-0 w-full max-w-sm bg-slate-900 z-50 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">
                  <FilterContent />
                </div>
              </div>
            </>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {loadProduct ? (
              // Loading State with Skeletons
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {[...Array(12)].map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : product?.length > 0 ? (
              // Products Grid
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {product.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-video bg-slate-950 overflow-hidden"         onClick={() => router.push(`/product/${item.slug}`)}>
                      <img
                        src={item.images?.[0]?.url || "/placeholder.svg"}
                        alt={item.name}
                
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <button 
                        className="absolute top-3 right-3 p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg hover:bg-slate-800 transition-colors border border-slate-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          setWishlist(prev => 
                            prev.includes(item.id.toString()) 
                              ? prev.filter(id => id !== item.id.toString())
                              : [...prev, item.id.toString()]
                          )
                        }}
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
                        Digital Key
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
                                  filled ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
                                }
                              />
                            )
                          })}
                        </div>
                        <span className="text-xs text-slate-400">
                          ({item.reviews?.length || 0} reviews)
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
                        className="w-full py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 shadow-lg hover:shadow-blue-500/50"
                      >
                        {addingToCart === item.id ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={18} />
                            <span>{item.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="text-center py-20 bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700">
                <Monitor size={64} className="mx-auto text-slate-600 mb-4" />
                <p className="text-lg text-slate-300 mb-6">No digital products found matching your filters</p>
                <button
                  onClick={() => {
                    setSelectedCategory("")
                    setPriceRange([0, 25000000])
                    setSortBy("featured")
                    getProduct()
                  }}
                  className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {cartOpen && <ShoppingCartModal onClose={() => setCartOpen(false)} />}
    </div>
  )
}