"use client"

import { useState } from "react"
import ProductCard from "./product-card"
import { ShoppingCart } from "lucide-react"

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Organic Cotton T-Shirt",
    price: 29.99,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
  },
  {
    id: 2,
    name: "Bamboo Water Bottle",
    price: 24.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop",
  },
  {
    id: 3,
    name: "Eco-Friendly Notebook",
    price: 14.99,
    category: "Stationery",
    image: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=500&fit=crop",
  },
  {
    id: 4,
    name: "Natural Soap Set",
    price: 19.99,
    category: "Beauty",
    image: "https://images.unsplash.com/photo-1600857062241-98e5dba7214d?w=500&h=500&fit=crop",
  },
  {
    id: 5,
    name: "Recycled Backpack",
    price: 49.99,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
  },
  {
    id: 6,
    name: "Sustainable Sneakers",
    price: 79.99,
    category: "Footwear",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
  },
]

export default function ProductGrid() {
  const [cart, setCart] = useState<any[]>([])
  const [showCart, setShowCart] = useState(false)

  const handleAddToCart = (product: any) => {
    setCart([...cart, product])
  }

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0)

  return (
    <div>
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowCart(!showCart)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center gap-2"
        >
          <ShoppingCart size={24} />
          <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
            {cart.length}
          </span>
        </button>
      </div>

      {showCart && (
        <div className="fixed bottom-24 right-6 z-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <h3 className="text-white font-semibold mb-4">Shopping Cart</h3>
          {cart.length === 0 ? (
            <p className="text-slate-400 text-sm">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-start bg-slate-700 p-2 rounded">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{item.name}</p>
                      <p className="text-blue-400 text-sm">${item.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromCart(index)}
                      className="text-red-400 hover:text-red-300 text-xs ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-600 pt-2">
                <p className="text-white font-semibold">Total: ${total.toFixed(2)}</p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={() => handleAddToCart(product)} />
        ))}
      </div>
    </div>
  )
}
