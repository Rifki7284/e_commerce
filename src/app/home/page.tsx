import {
  ShoppingCart,
  Download,
  Key,
  Zap,
  TrendingUp,
  Award,
  Shield,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import ClientHeader from "@/components/client/client-header";
import ProductGrid from "@/components/product/product-grid";
import { Suspense } from "react";
import ProductSkeleton from "@/components/product/product-skeleton";
import { Metadata } from "next";
import PopularCategories from "@/components/category/popular-categories";
export const metadata: Metadata = {
  title:
    "GameKeys Indonesia – Steam Key Murah, Game Original, Gift Card & Top Up",
  description:
    "GameKeys Indonesia adalah tempat terbaik untuk membeli game original, Steam Key, Origin, Ubisoft, Epic Games, PlayStation, Xbox, dan Nintendo. Harga murah, pengiriman instan, 100% legal & terpercaya.",
  keywords: [
    "steam key murah",
    "beli game original",
    "steam indonesia",
    "digital game key",
    "game murah pc",
    "gift card murah",
    "top up game",
    "origin key",
    "ubisoft key",
    "gamekeys",
  ],
  openGraph: {
    title: "GameKeys Indonesia – Steam Key, Game Original & Gift Card Termurah",
    siteName: "GameKeys Indonesia",
    description:
      "Beli game original dan digital key termurah! Steam, Epic Games, EA, Ubisoft, PlayStation, Xbox & Nintendo. Proses cepat, aman, dan terpercaya.",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GameKeys Indonesia – Steam Key & Game Original Termurah",
    description:
      "Tempat terbaik beli Steam Key, game original, gift card, dan top up. Harga murah, instan, legal, dan aman.",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default async function HomePage({
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const params = await searchParams;
  const page = params?.page ?? "1";
  const perPage = "8";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const res = await fetch(
    `${baseUrl}/api/products?page=${page}&perPage=${perPage}`
  );
  const data = await res.json();

  const category = await fetch(`${baseUrl}/api/category/popular`);
  const dataCategory = await category.json();
  const dataProduct = data.product;
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <ClientHeader />

      {/* Hero Banner with Promotion */}
      <section className="relative overflow-hidden border-b border-slate-700">
        {/* Animated Background */}

        <div className="absolute inset-0 bg-linear-to-br from-blue-900/30 via-purple-900/30 to-slate-900/30"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full mb-6">
              <Zap size={16} className="text-orange-400" />
              <span className="text-orange-300 text-sm font-bold uppercase tracking-wide">
                Flash Sale - Up to 70% Off
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              <span className="bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Digital Games
              </span>
              <br />
              Instant Delivery
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Get your favorite PC games, Steam keys, gift cards, and software
              instantly.
              <span className="text-blue-400 font-semibold">
                {" "}
                Safe, fast, and affordable.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/product"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105"
              >
                <ShoppingCart size={20} />
                Browse Games
              </Link>
              <Link
                href="/product?category=gift-cards"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/80 backdrop-blur-sm text-white border border-slate-700 rounded-xl font-bold hover:bg-slate-700 transition-all"
              >
                <Key size={20} />
                Gift Cards
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-slate-700 bg-slate-900/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Download,
                text: "Instant Delivery",
                subtext: "Get keys immediately",
              },
              {
                icon: Shield,
                text: "100% Secure",
                subtext: "Safe transactions",
              },
              {
                icon: Award,
                text: "Official Keys",
                subtext: "Authorized reseller",
              },
              {
                icon: TrendingUp,
                text: "Best Prices",
                subtext: "Guaranteed lowest",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-blue-500/30">
                  <item.icon size={24} className="text-blue-400" />
                </div>
                <p className="font-bold text-white text-sm mb-1">{item.text}</p>
                <p className="text-xs text-slate-400">{item.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-linear-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h2 className="text-4xl font-black text-white">Featured Games</h2>
          </div>
          <p className="text-slate-400 text-lg">
            Handpicked digital products just for you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Suspense fallback={<ProductSkeleton />}>
            <ProductGrid product={dataProduct} />
          </Suspense>
          <div className="w-full  col-span-1 sm:col-span-2 lg:col-span-4">
            {dataProduct && dataProduct.length > 0 && (
              <div className="flex justify-center mt-8">
                <Link
                  href="/product"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
                >
                  <span>Show All Products</span>
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-slate-900/50 border-y border-slate-700 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-linear-to-b from-purple-500 to-pink-600 rounded-full"></div>
              <h2 className="text-4xl font-black text-white">
                Popular Categories
              </h2>
            </div>
            <p className="text-slate-400 text-lg">
              Explore our digital product collections
            </p>
          </div>
          {dataCategory.data ? (
            <PopularCategories categories={dataCategory.data} />
          ) : (
            <div className="col-span-full">
              <div className="text-center flex flex-col py-20 bg-linear-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-2">
                  No Category Found
                </h3>
                <p className="text-slate-400">
                  Check back later for amazing deals!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-4">
            Why Choose GameKeys?
          </h2>
          <p className="text-slate-400 text-lg">
            Your trusted digital marketplace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Download,
              title: "Instant Delivery",
              description: "Get your digital keys within seconds of purchase",
            },
            {
              icon: Shield,
              title: "100% Secure",
              description:
                "Encrypted transactions and verified payment methods",
            },
            {
              icon: Award,
              title: "Official Products",
              description: "All keys are sourced from authorized distributors",
            },
            {
              icon: TrendingUp,
              title: "Best Prices",
              description:
                "Competitive pricing with regular discounts and deals",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all group"
            >
              <div className="w-14 h-14 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-blue-500/30">
                <feature.icon size={28} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
