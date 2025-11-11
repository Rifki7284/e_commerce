"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ShoppingCart, Heart, SearchIcon } from "lucide-react"
import ClientHeader from "@/components/client/client-header"
import ShoppingCartModal from "@/components/store/shopping-cart"

const ALL_PRODUCTS = [
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
    id: "2",
    name: "Wireless Headphones",
    category: "electronics",
    price: 199,
    originalPrice: 249,
    image: "/diverse-people-listening-headphones.png",
    description: "Premium sound quality headphones",
    rating: 4.7,
    reviews: 256,
    discount: 20,
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
    id: "4",
    name: "Wireless Mouse",
    category: "electronics",
    price: 49,
    originalPrice: 79,
    image: "/field-mouse.png",
    description: "Ergonomic wireless mouse",
    rating: 4.4,
    reviews: 342,
    discount: 38,
  },
  {
    id: "5",
    name: "Desk Lamp",
    category: "furniture",
    price: 79,
    originalPrice: 99,
    image: "/vintage-desk-lamp.png",
    description: "LED desk lamp with adjustable brightness",
    rating: 4.6,
    reviews: 157,
    discount: 20,
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
  {
    id: "8",
    name: "Bookshelf",
    category: "furniture",
    price: 149,
    originalPrice: 199,
    image: "/cozy-bookshelf.png",
    description: "Modern wooden bookshelf with storage",
    rating: 4.3,
    reviews: 76,
    discount: 25,
  },
]

export default function SearchPage() {
  const [user, setUser] = useState<any>(null)
  const [cart, setCart] = useState<any[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(storedUser))

    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }

    const savedWishlist = localStorage.getItem("wishlist")
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist))
    }

    const query = searchParams.get("q")
    if (query) {
      setSearchQuery(query)
    }

    setIsLoading(false)
  }, [router, searchParams])

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

  const filteredProducts = ALL_PRODUCTS.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader cartCount={cart.length} onCartOpen={() => setCartOpen(true)} user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <SearchIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Results */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {searchQuery ? `Search results for "${searchQuery}"` : "Search Products"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {searchQuery ? `Found ${filteredProducts.length} products` : "Enter a search term to find products"}
          </p>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
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
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No products found matching your search" : "Start typing to search"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

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
