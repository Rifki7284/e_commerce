"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, Star } from "lucide-react"

interface ProductCardProps {
  product: any
  onAddToCart: () => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-blue-500 transition-colors">
      <div className="relative h-48 bg-slate-700">
        <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold">
          {product.category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold mb-2 line-clamp-2">{product.name}</h3>

        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} className={i < 4 ? "fill-yellow-400 text-yellow-400" : "text-slate-600"} />
          ))}
          <span className="text-xs text-slate-400">(124)</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-blue-400">${product.price.toFixed(2)}</p>
          <Button
            onClick={onAddToCart}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
          >
            <ShoppingCart size={16} />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
