"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Heart, ShoppingCart, Star, Minus, Plus, ChevronLeft, Loader2, Truck, Shield, RotateCcw, Send, Key, Download } from "lucide-react"
import Link from "next/link"
import ClientHeader from "@/components/client/client-header"
import ShoppingCartModal from "@/components/store/shopping-cart"
import formatPrice from "@/lib/formatPrice"

export interface Product {
  id: number
  name: string
  price: number
  description: string
  stock: number
  categories: Category
  images: ProductImage[]
  reviews?: Review[]
  slug: string
}

interface Category {
  name: string
  slug: string
}

interface ProductImage {
  url: string
}

export interface User {
  id: number;
  name: string | null;
  email: string;
}

export interface Review {
  id: number;
  star: number;
  review: string;
  productId: number;
  userId: number;
  product?: Product;
  user?: User;
}

// Loading Skeleton
const DetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <div className="bg-slate-800 rounded-xl h-96 mb-4"></div>
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-lg h-20"></div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-8 bg-slate-800 rounded w-3/4"></div>
        <div className="h-6 bg-slate-800 rounded w-1/2"></div>
        <div className="h-4 bg-slate-800 rounded w-full"></div>
      </div>
    </div>
  </div>
)

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [cartOpen, setCartOpen] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description")
  const [cart, setCart] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  // Review form states
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [hoveredStar, setHoveredStar] = useState(0)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState("")
  const [existingReview, setExistingReview] = useState()
  const { slug } = useParams();
  const productSlug = slug
  const router = useRouter()

  useEffect(() => {
    getProductDetail()
    loadWishlist()
    getExistingReview()
  }, [productSlug, product?.id])

  const getExistingReview = async () => {
    try {
      if (product?.id != undefined) {
        const res = await fetch(`/api/reviews/me?productId=${product?.id}`)
        const data = await res.json()
        setExistingReview(data)
      }
    }
    catch (e) {
      console.log(e)
    }
  }

  const loadWishlist = () => {
    const saved = localStorage.getItem("wishlist")
    if (saved) {
      setWishlist(JSON.parse(saved))
    }
  }

  const getProductDetail = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/detail/${productSlug}`)
      const data = await res.json()
      setProduct(data.product[0])
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWishlist = () => {
    if (!product) return
    const updated = wishlist.includes(product.id.toString())
      ? wishlist.filter((id) => id !== product.id.toString())
      : [...wishlist, product.id.toString()]
    setWishlist(updated)
    localStorage.setItem("wishlist", JSON.stringify(updated))
  }

  const addToCart = async (product: Product) => {
    setAddingToCart(true)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
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
      setAddingToCart(false)
    }
  }

  const submitReview = async () => {
    if (!user) {
      setReviewError("Silakan login terlebih dahulu untuk memberikan review.")
      return
    }

    if (reviewRating === 0) {
      setReviewError("Silakan pilih rating bintang.")
      return
    }

    if (reviewText.trim().length < 10) {
      setReviewError("Review minimal 10 karakter.")
      return
    }

    setSubmittingReview(true)
    setReviewError("")

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product?.id,
          star: reviewRating,
          review: reviewText.trim(),
        }),
      })

      if (res.status === 401) {
        setReviewError("Silakan login terlebih dahulu.")
        return
      }

      if (!res.ok) {
        const err = await res.json()
        setReviewError(err.message || "Gagal mengirim review.")
        return
      }

      // Reset form
      setReviewRating(0)
      setReviewText("")
      setReviewError("")

      // Refresh product data to show new review
      await getProductDetail()

      alert("Review berhasil ditambahkan!")
    } catch (error) {
      console.error("Error submitting review:", error)
      setReviewError("Terjadi kesalahan saat mengirim review.")
    } finally {
      setSubmittingReview(false)
    }
  }

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const calculateAverageRating = () => {
    if (!product?.reviews || product.reviews.length === 0) return 0
    const sum = product.reviews.reduce((acc, review) => acc + review.star, 0)
    return (sum / product.reviews.length).toFixed(1)
  }

  const getRatingDistribution = () => {
    if (!product?.reviews) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    const distribution: any = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    product.reviews.forEach((review) => {
      distribution[review.star] = (distribution[review.star] || 0) + 1
    })
    return distribution
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
        <ClientHeader onCartOpen={() => setCartOpen(true)} />
        <DetailSkeleton />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
        <ClientHeader onCartOpen={() => setCartOpen(true)} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
          <Link href="/client/products" className="text-blue-400 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const averageRating = calculateAverageRating()
  const ratingDistribution = getRatingDistribution()
  const displayImages = Array.isArray(product?.images)
    ? [...product.images]
    : [];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20 pointer-events-none"></div>
      <div className="fixed top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <ClientHeader onCartOpen={() => setCartOpen(true)} />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <button onClick={() => router.back()} className="hover:text-blue-400 transition-colors flex items-center gap-1">
            <ChevronLeft size={16} />
            Back
          </button>
          <span>/</span>
          <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/client/products" className="hover:text-blue-400 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="relative bg-linear-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden mb-4 aspect-video border border-slate-700">
              <img
                src={displayImages[selectedImage]?.url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Digital Badge */}
              <div className="absolute top-4 left-4 bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 border border-blue-400/30">
                <Key size={14} />
                Digital Key
              </div>

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative bg-linear-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden aspect-video border-2 transition-all ${
                      selectedImage === index
                        ? "border-blue-500 shadow-lg shadow-blue-500/30"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className="text-sm text-blue-400 uppercase tracking-wide font-semibold">
                {product.categories?.name || "Digital Product"}
              </span>
            </div>

            <h1 className="text-4xl font-black text-white mb-4 leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(Number(averageRating)) ? "fill-current" : ""}
                    />
                  ))}
                </div>
                <span className="text-xl font-bold text-white">{averageRating}</span>
              </div>
              <span className="text-slate-400">
                ({product.reviews?.length || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6 bg-linear-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-5xl font-black text-white">
                  {formatPrice(product.price)}
                </span>
                <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                  <Download size={14} />
                  Instant Delivery
                </div>
              </div>
              {product.stock > 0 && product.stock < 10 && (
                <p className="text-orange-400 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                  Only {product.stock} left in stock!
                </p>
              )}
            </div>

            {/* Description Preview */}
            <p className="text-slate-300 mb-6 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-white mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-4 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-8 font-bold text-white text-lg">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="p-4 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <span className="text-sm text-slate-400">
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => addToCart(product)}
                disabled={product.stock === 0 || addingToCart}
                className="flex-1 py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02]"
              >
                {addingToCart ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={toggleWishlist}
                className={`p-4 border rounded-xl transition-all ${
                  wishlist.includes(product.id.toString())
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                }`}
              >
                <Heart
                  size={24}
                  className={wishlist.includes(product.id.toString()) ? "fill-current" : ""}
                />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-3 bg-linear-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-6">
              {[
                { icon: Download, title: "Instant Delivery", desc: "Get your key immediately" },
                { icon: Shield, title: "100% Secure", desc: "Safe payment guaranteed" },
                { icon: RotateCcw, title: "Easy Returns", desc: "30 days refund policy" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="p-2 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                    <item.icon className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-linear-to-br from-slate-800/30 to-slate-900/30 border border-slate-700 rounded-xl overflow-hidden">
          <div className="flex gap-8 border-b border-slate-700 px-6">
            <button
              onClick={() => setActiveTab("description")}
              className={`py-4 font-bold border-b-2 transition-colors ${
                activeTab === "description"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 font-bold border-b-2 transition-colors ${
                activeTab === "reviews"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
          </div>

          <div className="p-6">
            {activeTab === "description" ? (
              <div>
                <h3 className="text-2xl font-black text-white mb-4">Product Description</h3>
                <p className="text-slate-300 leading-relaxed">{product.description}</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Rating Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
                      <div className="text-center mb-6">
                        <div className="text-6xl font-black text-white mb-2">{averageRating}</div>
                        <div className="flex justify-center text-yellow-400 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={20}
                              className={i < Math.floor(Number(averageRating)) ? "fill-current" : ""}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-slate-400">
                          Based on {product.reviews?.length || 0} reviews
                        </p>
                      </div>

                      {/* Rating Distribution */}
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-sm w-8 text-slate-300 font-semibold">{star}★</span>
                            <div className="flex-1 bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-linear-to-r from-yellow-400 to-orange-400 rounded-full h-2"
                                style={{
                                  width: `${
                                    product.reviews?.length
                                      ? (ratingDistribution[star] / product.reviews.length) * 100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-slate-400 w-8">
                              {ratingDistribution[star]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="lg:col-span-2">
                    {/* Write Review Form */}
                    {existingReview == null && (
                      <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 mb-8">
                        <h3 className="text-xl font-black text-white mb-4">Write a Review</h3>

                        {/* Star Rating Selector */}
                        <div className="mb-4">
                          <label className="block text-sm font-bold text-white mb-2">Your Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                className="transition-transform hover:scale-110"
                                disabled={submittingReview}
                              >
                                <Star
                                  size={32}
                                  className={`${
                                    star <= (hoveredStar || reviewRating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-slate-600"
                                  } transition-colors`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Review Text */}
                        <div className="mb-4">
                          <label className="block text-sm font-bold text-white mb-2">Your Review</label>
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your thoughts about this product..."
                            className="w-full min-h-[120px] px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            disabled={submittingReview}
                          />
                          <p className="text-xs text-slate-400 mt-1">
                            Minimum 10 characters
                          </p>
                        </div>

                        {/* Error Message */}
                        {reviewError && (
                          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {reviewError}
                          </div>
                        )}

                        {/* Submit Button */}
                        <button
                          onClick={submitReview}
                          disabled={submittingReview || !user}
                          className="w-full py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                        >
                          {submittingReview ? (
                            <>
                              <Loader2 size={20} className="animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send size={20} />
                              Submit Review
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Reviews List */}
                    {product.reviews && product.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {product.reviews.map((review) => (
                          <div
                            key={review.id}
                            className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-bold text-white text-lg">
                                  {review.user?.name || "Anonymous"}
                                </p>
                                <div className="flex text-yellow-400 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={16}
                                      className={i < review.star ? "fill-current" : ""}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{review.review}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Star size={48} className="mx-auto text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
                        <p className="text-slate-400">
                          Be the first to review this product!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {cartOpen && <ShoppingCartModal onClose={() => setCartOpen(false)} />}
    </div>
  )
}