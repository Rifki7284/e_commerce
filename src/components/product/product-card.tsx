"use client";
import formatPrice from "@/lib/formatPrice";
import {
  Download,
  Heart,
  Key,
  Loader2,
  ShoppingCart,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
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

interface Category {
  name: string;
  slug: string;
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

const ProductCard = ({ product }: ProductCardProps) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const router = useRouter();

  const toggleWishlist = (productId: string) => {
    const updated = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  const addToCart = async (product: Product) => {
    setAddingToCart(product.id);
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
      });

      if (res.status === 401) {
        alert("Silakan login terlebih dahulu untuk menambahkan ke keranjang.");
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        console.error("Gagal menambahkan ke keranjang:", err);
        alert("Terjadi kesalahan saat menambahkan ke keranjang.");
        return;
      }

      const data = await res.json();
      console.log("✅ Added to cart:", data);
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      alert("Terjadi kesalahan saat menambahkan ke keranjang.");
    } finally {
      setAddingToCart(null);
    }
  };

  // Calculate average rating
  const reviews = product.reviews ?? [];
  const avgStar =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.star, 0) / reviews.length
      : 0;

  return (
    <div
      key={product.id}
      className="group bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 flex flex-col h-full"
    >
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-video bg-slate-950 overflow-hidden shrink-0">
          <img
            src={product.images?.[0]?.url || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id.toString());
            }}
            className="absolute top-3 right-3 p-2 bg-slate-900/80 backdrop-blur-sm rounded-lg hover:bg-slate-800 transition-colors border border-slate-700 z-10"
          >
            <Heart
              size={18}
              className={
                wishlist.includes(product.id.toString())
                  ? "fill-red-500 text-red-500"
                  : "text-slate-400"
              }
            />
          </button>

          {/* Digital Badge */}
          <div className="absolute top-3 left-3 bg-blue-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border border-blue-400/30">
            <Key size={12} />
            Digital
          </div>

          {product.stock < 10 && product.stock > 0 && (
            <div className="absolute bottom-3 left-3 bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-semibold border border-orange-400/30">
              Only {product.stock} left
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
              <span className="text-slate-300 font-bold text-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content - Flexible with Fixed Heights */}
      <div className="p-4 flex flex-col grow">
        {/* Category - Fixed Height */}
        <p className="text-xs text-blue-400 uppercase tracking-wide mb-2 font-semibold h-4">
          {product.categories?.name || "Digital Product"}
        </p>

        {/* Title - Fixed Height with Line Clamp */}
        <h3
          className="font-bold text-base text-white mb-3 line-clamp-2 cursor-pointer hover:text-blue-400 transition-colors h-12 leading-6"
          onClick={() => router.push(`/product/${product.slug}`)}
        >
          {product.name}
        </h3>

        {/* Rating - Fixed Height */}
        <div className="flex items-center gap-2 mb-4 h-5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => {
              const filled = i < Math.round(avgStar);
              return (
                <Star
                  key={i}
                  size={14}
                  className={
                    filled
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-600"
                  }
                />
              );
            })}
          </div>
          <span className="text-xs text-slate-400">({reviews.length})</span>
        </div>

        {/* Spacer to push content to bottom */}
        <div className="grow"></div>

        {/* Price - Fixed Height */}
        <div className="flex items-center justify-between mb-4 h-8">
          <span className="text-2xl font-black text-white">
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
            <Download size={12} />
            Instant
          </div>
        </div>

        {/* Add to Cart Button - Fixed Height */}
        <button
          onClick={() => addToCart(product)}
          disabled={product.stock === 0 || addingToCart === product.id}
          className="w-full h-12 py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 shadow-lg hover:shadow-blue-500/50"
        >
          {addingToCart === product.id ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
