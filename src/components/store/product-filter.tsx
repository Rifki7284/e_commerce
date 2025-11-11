"use client"
import { Button } from "@/components/ui/button"

interface ProductFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
}

export default function ProductFilter({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
}: ProductFilterProps) {
  const categories = [
    { id: "all", label: "All Products" },
    { id: "electronics", label: "Electronics" },
    { id: "furniture", label: "Furniture" },
  ]

  return (
    <aside className="w-64 border-r border-border bg-card p-6">
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 font-semibold text-foreground">Category</h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onCategoryChange(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-foreground">Price Range</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Min: ${priceRange[0]}</label>
              <input
                type="range"
                min="0"
                max="2000"
                value={priceRange[0]}
                onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]] as [number, number])}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Max: ${priceRange[1]}</label>
              <input
                type="range"
                min="0"
                max="2000"
                value={priceRange[1]}
                onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)] as [number, number])}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
