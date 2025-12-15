"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Filter, Gamepad2, X } from "lucide-react";
import formatPrice from "@/lib/formatPrice";
import ProductCard from "./product-card";

// ============= INTERFACES =============
interface FilterProps {
  category: Category[];
  product: Product[];
  page: number;
  totalPage: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  iconName: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  slug: string;
  description: string;
  stock: number;
  categories: Category;
  images: ProductImage[];
  reviews?: Review[];
}

interface ProductImage {
  url: string;
}

export interface ReviewUser {
  id: number;
  name: string;
  email: string;
}

export interface Review {
  id: number;
  star: number;
  review: string;
  productId: number;
  userId: number;
  user: ReviewUser;
}

// ============= MAIN COMPONENT =============
const ProductFilter = ({ category, product, page, totalPage }: FilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  // States
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 25000000]);

  // ============= HANDLERS =============
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", search ?? "");
    params.set("category", selectedCategory);
    params.set("maxPrice", String(priceRange[1]));
    params.set("minPrice", String(priceRange[0]));
    params.set("sort", sortBy);
    router.push(`${pathname}?${params.toString()}`);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  // ============= SUB COMPONENTS =============
  const ProductResults = () => (
    <>
      {product.length > 0 ? (
        product.map((item, idx) => <ProductCard key={item.id || idx} product={item} />)
      ) : (
        <div className="col-span-full">
          <div className="text-center flex flex-col py-20 bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Products Found</h3>
            <p className="text-slate-400">Check back later for amazing deals!</p>
          </div>
        </div>
      )}
    </>
  );

  const PaginationControls = () => (
    <div className="flex justify-center items-center mt-10 gap-2">
      <button
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
        className="px-4 py-2 rounded-lg font-medium text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-slate-700"
      >
        Prev
      </button>

      <div className="flex gap-2">
        {Array.from({ length: totalPage }).map((_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`min-w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                p === page
                  ? "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        disabled={page >= totalPage}
        onClick={() => goToPage(page + 1)}
        className="px-4 py-2 rounded-lg font-medium text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-slate-700"
      >
        Next
      </button>
    </div>
  );

  const FilterContent = () => (
    <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-5 shadow-xl">
      {/* Header */}
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
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
              All Products
            </span>
          </label>

          {category?.map((item) => (
            <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                value={item.id.toString()}
                checked={selectedCategory === item.id.toString()}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors capitalize">
                {item.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
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
                const value = e.target.value;
                setPriceRange([value === "" ? 0 : Number(value), priceRange[1]]);
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
              onBlur={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value) || 25000000])
              }
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="25000000"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
        </p>
      </div>

      {/* Sort Filter */}
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

      {/* Apply Button */}
      <Button
        onClick={applyFilters}
        className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
      >
        Apply Filters
      </Button>
    </div>
  );

  // ============= RENDER =============
  return (
    <div className="container mx-auto px-4 py-8 md:py-10">
      {/* Mobile Filter Button */}
      <button
        onClick={() => setFilterOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-linear-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-110"
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
            <div className="lg:hidden fixed inset-y-0 right-0 w-full max-w-sm bg-slate-900 z-50 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="p-4">
                <FilterContent />
              </div>
            </div>
          </>
        )}

        {/* Products Grid & Pagination */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            <ProductResults />
          </div>
          
          {product.length > 0 && totalPage > 1 && <PaginationControls />}
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;