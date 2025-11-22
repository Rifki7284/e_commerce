"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, ShoppingCart, Loader2, Star } from "lucide-react"
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
  <div className="group bg-card rounded-lg border border-border overflow-hidden animate-pulse">
    <div className="relative h-48 bg-muted"></div>
    <div className="p-4">
      <div className="h-3 bg-muted rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-muted rounded w-full mb-2"></div>
      <div className="h-4 bg-muted rounded w-2/3 mb-3"></div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-4 bg-muted rounded w-24"></div>
      </div>
      <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
      <div className="h-10 bg-muted rounded w-full"></div>
    </div>
  </div>
)

export default function ClientHomePage() {
  const [user, setUser] = useState<any>(null)
  const [cart, setCart] = useState<any[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [perPage, setPerPage] = useState<number>(12)
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
    <div className="min-h-screen bg-background">
      <ClientHeader onCartOpen={() => setCartOpen(true)} />

      {/* Hero Banner with Promotion */}
      <section className="bg-linear-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-border">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-block px-4 py-1 bg-accent/20 rounded-full mb-4">
              <span className="text-accent text-sm font-semibold">Limited Time Offer</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Summer Collection Sale
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Discover amazing products with up to 25% discount. Limited stock available.
            </p>
            <Link
              href="/client/products"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Featured Products</h2>
          <p className="text-muted-foreground">Handpicked items just for you</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : product.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Products Found</h3>
            <p className="text-muted-foreground">Check back later for new items!</p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  <button
                    onClick={() => toggleWishlist(item.id.toString())}
                    className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-muted transition-colors"
                  >
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
                        const reviews = item.reviews ?? [];

                        const avgStar =
                          reviews.length > 0
                            ? reviews.reduce((acc, r) => acc + r.star, 0) / reviews.length
                            : 0;

                        const filled = i < Math.round(avgStar);

                        return (
                          <Star
                            key={i}
                            size={16}
                            className={
                              filled
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-400"
                            }
                          />
                        );
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
        )}
      </section>

      {/* Categories Section */}
      <section className="bg-muted/30 border-y border-border py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-8">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Electronics", icon: "📱", color: "from-blue-400/20 to-blue-600/20" },
              { name: "Furniture", icon: "🪑", color: "from-orange-400/20 to-orange-600/20" },
              { name: "Accessories", icon: "⌚", color: "from-purple-400/20 to-purple-600/20" },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/client/products?category=${category.name.toLowerCase()}`}
                className={`bg-linear-to-br ${category.color} border border-border rounded-lg p-8 text-center hover:shadow-lg transition-all group cursor-pointer`}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{category.name}</h3>
              </Link>
            ))}
          </div>
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