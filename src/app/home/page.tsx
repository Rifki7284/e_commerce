"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, ShoppingCart } from "lucide-react"
import Link from "next/link"
import ClientHeader from "@/components/client/client-header"
import ShoppingCartModal from "@/components/store/shopping-cart"

const FEATURED_PRODUCTS = [
  {
    id: "1",
    name: "Premium Laptop",
    category: "electronics",
    price: 1299,
    originalPrice: 1499,
    image: "/modern-laptop-workspace.png",
    description: "High-performance laptop for professionals",
    rating: 4.5,
    reviews: 128,
    discount: 13,
  },
  {
    id: "3",
    name: "Smart Watch",
    category: "electronics",
    price: 299,
    originalPrice: 399,
    image: "/modern-smartwatch.png",
    description: "Advanced fitness tracking smartwatch",
    rating: 4.3,
    reviews: 89,
    discount: 25,
  },
  {
    id: "6",
    name: "Office Chair",
    category: "furniture",
    price: 399,
    originalPrice: 499,
    image: "/comfortable-armchair.png",
    description: "Ergonomic office chair with lumbar support",
    rating: 4.8,
    reviews: 423,
    discount: 20,
  },
  {
    id: "7",
    name: "Standing Desk",
    category: "furniture",
    price: 599,
    originalPrice: 799,
    image: "/simple-wooden-desk.png",
    description: "Adjustable height standing desk",
    rating: 4.5,
    reviews: 198,
    discount: 25,
  },
]

export default function ClientHomePage() {
  const [user, setUser] = useState<any>(null)
  const [cart, setCart] = useState<any[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()


  const toggleWishlist = (productId: string) => {
    const updated = wishlist.includes(productId) ? wishlist.filter((id) => id !== productId) : [...wishlist, productId]
    setWishlist(updated)
    localStorage.setItem("wishlist", JSON.stringify(updated))
  }

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      let updatedCart
      if (existingItem) {
        updatedCart = prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        updatedCart = [...prevCart, { ...product, quantity: 1 }]
      }
      localStorage.setItem("cart", JSON.stringify(updatedCart))
      return updatedCart
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== productId)
      localStorage.setItem("cart", JSON.stringify(updatedCart))
      return updatedCart
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
      localStorage.setItem("cart", JSON.stringify(updatedCart))
      return updatedCart
    })
  }


  return (
    <div className="min-h-screen bg-background">
      <ClientHeader cartCount={cart.length} onCartOpen={() => setCartOpen(true)} user={user} />

      {/* Hero Banner with Promotion */}
      <section className="bg-linear-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-border">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-block px-4 py-1 bg-accent/20 rounded-full mb-4">
              <span className="text-accent text-sm font-semibold">Limited Time Offer</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Summer Collection Sale</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image Container */}
              <div className="relative h-48 bg-muted overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {product.discount && (
                  <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    -{product.discount}%
                  </div>
                )}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-muted transition-colors"
                >
                  <Heart
                    size={18}
                    className={
                      wishlist.includes(product.id) ? "fill-destructive text-destructive" : "text-muted-foreground"
                    }
                  />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{product.category}</p>
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{product.name}</h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold text-foreground">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(product)}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
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
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{category.icon}</div>
                <h3 className="text-xl font-semibold text-foreground">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {cartOpen && (
        <ShoppingCartModal
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateQuantity}
        />
      )}
    </div>
  )
}
