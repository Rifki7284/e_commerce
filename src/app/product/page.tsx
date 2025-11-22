"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ShoppingCart, Heart, Star, Loader2 } from "lucide-react"
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
    <div className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-48 bg-muted" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="h-3 w-20 bg-muted rounded" />
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
        
        {/* Rating */}
        <div className="h-4 w-32 bg-muted rounded" />
        
        {/* Price */}
        <div className="h-6 w-24 bg-muted rounded" />
        
        {/* Button */}
        <div className="h-10 w-full bg-muted rounded-lg" />
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [cart, setCart] = useState<any[]>([])
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
  }, [currentPage, search, selectedCategory, priceRange, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader cartCount={cart.length} onCartOpen={() => setCartOpen(true)} />

      <div className="container mx-auto px-4 py-8">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-background pb-6 mb-2">
          <h1 className="text-4xl font-bold text-foreground mb-2">All Products</h1>
          <p className="text-muted-foreground">Browse our complete collection</p>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar - Sticky */}
          <div className="w-64 shrink-0">
            <div className="sticky top-32 bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-foreground mb-3">Category</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ""}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-muted-foreground capitalize">All</span>
                  </label>
                  {category?.length > 0 ? (
                    category.map((item, index) => (
                      <label key={index} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={item.id.toString()}
                          checked={selectedCategory === item.id.toString()}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-muted-foreground capitalize">{item.name}</span>
                      </label>
                    ))
                  ) : null}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-foreground mb-3">Price Range</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Min Price</label>
                    <input
                      type="number"
                      min="0"
                      max="25000000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number.parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Max Price</label>
                    <input
                      type="number"
                      min="0"
                      max="25000000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value) || 25000000])}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                      placeholder="25000000"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                </p>
              </div>

              {/* Sort */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Sort By</p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loadProduct ? (
              // Loading State with Skeletons
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : product?.length > 0 ? (
              // Products Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {product.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Image Container */}
                    <div className="relative h-48 bg-muted overflow-hidden">
                      <img
                        src={item.images?.[0]?.url || "/placeholder.svg"}
                        alt={item.name}
                        onClick={() => router.push(`/product/${item.slug}`)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                      />

                      <button className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-muted transition-colors">
                        <Heart
                          size={18}
                          className={
                            wishlist.includes(item.id.toString())
                              ? "fill-destructive text-destructive"
                              : "text-muted-foreground"
                          }
                        />
                      </button>

                      {item.stock < 10 && item.stock > 0 && (
                        <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Only {item.stock} left
                        </div>
                      )}

                      {item.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        {item.categories?.name || "Uncategorized"}
                      </p>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {item.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
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
                                size={16}
                                className={
                                  filled ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                                }
                              />
                            )
                          })}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({item.reviews?.length || 0})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-bold text-foreground">
                          {formatPrice(item.price)}
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => addToCart(item)}
                        disabled={item.stock === 0 || addingToCart === item.id}
                        className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            ) : (
              // Empty State
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found matching your filters</p>
                <button
                  onClick={() => {
                    setSelectedCategory("")
                    setPriceRange([0, 25000000])
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90"
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