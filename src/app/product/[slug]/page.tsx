"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Heart, ShoppingCart, Star, Minus, Plus, ChevronLeft, Loader2, Truck, Shield, RotateCcw, Send } from "lucide-react"
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

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  slug: string;
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
        <div className="bg-muted rounded-lg h-96 mb-4"></div>
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-muted rounded-lg h-20"></div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-3/4"></div>
        <div className="h-6 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
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
      <div className="min-h-screen bg-background">
        <ClientHeader onCartOpen={() => setCartOpen(true)} />
        <DetailSkeleton />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <ClientHeader onCartOpen={() => setCartOpen(true)} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Link href="/client/products" className="text-primary hover:underline">
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
    <div className="min-h-screen bg-background">
      <ClientHeader onCartOpen={() => setCartOpen(true)} />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/client/products" className="hover:text-foreground">Products</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="relative bg-muted rounded-lg overflow-hidden mb-4 aspect-square">
              <img
                src={displayImages[selectedImage]?.url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
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
                    className={`relative bg-muted rounded-lg overflow-hidden aspect-square border-2 transition-all ${selectedImage === index
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground/30"
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
              <span className="text-sm text-muted-foreground uppercase tracking-wide">
                {product.categories?.name || "Uncategorized"}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(Number(averageRating)) ? "fill-current" : ""}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{averageRating}</span>
              </div>
              <span className="text-muted-foreground">
                ({product.reviews?.length || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-4xl font-bold text-foreground mb-2">
                {formatPrice(product.price)}
              </div>
              {product.stock > 0 && product.stock < 10 && (
                <p className="text-orange-600 font-medium">Only {product.stock} left in stock!</p>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-6 font-semibold">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="p-3 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => addToCart(product)}
                disabled={product.stock === 0 || addingToCart}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className={`p-3 border rounded-lg transition-colors ${wishlist.includes(product.id.toString())
                  ? "bg-destructive/10 border-destructive text-destructive"
                  : "border-border hover:bg-muted"
                  }`}
              >
                <Heart
                  size={24}
                  className={wishlist.includes(product.id.toString()) ? "fill-current" : ""}
                />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Truck className="text-primary" size={24} />
                </div>
                <div>
                  <p className="font-medium text-sm">Free Delivery</p>
                  <p className="text-xs text-muted-foreground">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="text-primary" size={24} />
                </div>
                <div>
                  <p className="font-medium text-sm">Warranty</p>
                  <p className="text-xs text-muted-foreground">1 year guarantee</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <RotateCcw className="text-primary" size={24} />
                </div>
                <div>
                  <p className="font-medium text-sm">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30 days return</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border">
          <div className="flex gap-8 border-b border-border">
            <button
              onClick={() => setActiveTab("description")}
              className={`py-4 font-semibold border-b-2 transition-colors ${activeTab === "description"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 font-semibold border-b-2 transition-colors ${activeTab === "reviews"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
          </div>

          <div className="py-8">
            {activeTab === "description" ? (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Rating Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-muted/30 rounded-lg p-6">
                      <div className="text-center mb-4">
                        <div className="text-5xl font-bold mb-2">{averageRating}</div>
                        <div className="flex justify-center text-yellow-500 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={20}
                              className={i < Math.floor(Number(averageRating)) ? "fill-current" : ""}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Based on {product.reviews?.length || 0} reviews
                        </p>
                      </div>

                      {/* Rating Distribution */}
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-sm w-8">{star}★</span>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className="bg-yellow-500 rounded-full h-2"
                                style={{
                                  width: `${product.reviews?.length
                                    ? (ratingDistribution[star] / product.reviews.length) * 100
                                    : 0
                                    }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground w-8">
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
                    {existingReview == null && <div className="bg-muted/30 rounded-lg p-6 mb-8">
                      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

                      {/* Star Rating Selector */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Your Rating</label>
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
                                className={`${star <= (hoveredStar || reviewRating)
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-muted-foreground"
                                  } transition-colors`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Text */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Your Review</label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Share your thoughts about this product..."
                          className="w-full min-h-[120px] px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          disabled={submittingReview}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Minimum 10 characters
                        </p>
                      </div>

                      {/* Error Message */}
                      {reviewError && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                          {reviewError}
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        onClick={submitReview}
                        disabled={submittingReview || !user}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

                      {/* {!user && (
                        <p className="text-sm text-muted-foreground text-center mt-3">
                          Please <Link href="/login" className="text-primary hover:underline">login</Link> to write a review
                        </p>
                      )} */}
                    </div>}

                    {/* Reviews List */}
                    {product.reviews && product.reviews.length > 0 ? (
                      <div className="space-y-6">
                        {product.reviews.map((review) => (
                          <div key={review.id} className="border-b border-border pb-6 last:border-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold">
                                  {review.user?.name || "Anonymous"}
                                </p>
                                <div className="flex text-yellow-500 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={16}
                                      className={i < review.star ? "fill-current" : ""}
                                    />
                                  ))}
                                </div>
                              </div>
                              {/* {review.createdAt && (
                                <span className="text-sm text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              )} */}
                            </div>
                            <p className="text-muted-foreground">{review.review}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Star size={48} className="mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                        <p className="text-muted-foreground">
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