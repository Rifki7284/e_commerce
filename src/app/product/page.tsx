import { Download } from "lucide-react"
import ClientHeader from "@/components/client/client-header"
import ProductFilter from "@/components/product/product-filter";
import { Metadata } from "next";
export async function generateMetadata({ searchParams }: { searchParams: { search?: string } }): Promise<Metadata> {
  const params = await searchParams
  const query = params?.search?.toLocaleLowerCase() ?? "game";
  const title = `Cari ${query} – Hasil Pencarian | GameKeys Indonesia`;
  const description = `Temukan hasil pencarian untuk "${query}" di GameKeys Indonesia. Steam key, game original, digital key, dan gift card dengan harga terbaik.`;
  const keywords = [
    `${query} murah`,
    `beli ${query} original`,
    `${query} steam`,
    `${query} key`,
    "pencarian game",
    "steam key murah",
    "game original indonesia"
  ];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      siteName: "GameKeys Indonesia",
      description,
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
      }
    }
  };
}
export default async function ProductsPage({
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const params = await searchParams
  const page = params?.page ?? "1";
  const search = params?.search ?? "";
  const category = params?.category ?? "";
  const maxPrice = params?.maxPrice ?? "";
  const minPrice = params?.minPrice ?? "";
  const sortBy = params?.sortBy ?? "";
  const perPage = "9";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const resProduct = await fetch(`${baseUrl}/api/products?page=${page}&perPage=${perPage}&search=${search == null ? "" : search}&category=${category}&maxPrice=${maxPrice}&minPrice=${minPrice}&sort=${sortBy}`, {
    cache: "no-store",
  });
  const resCat = await fetch(`${baseUrl}/api/category`, {
    cache: "no-store",
  });
  const dataProduct = await resProduct.json();
  const dataCat = await resCat.json()

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <ClientHeader />

      {/* Hero Header */}
      <div className="relative bg-linear-to-r from-blue-900/50 via-purple-900/50 to-blue-900/50 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 px-4 py-2 rounded-full mb-4">
            <Download size={16} className="text-blue-400" />
            <p className="text-xs md:text-sm font-semibold text-blue-300 uppercase tracking-wider">
              Instant Digital Delivery
            </p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-4 bg-linear-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text">
            Game Keys & Digital Products
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
            Browse thousands of digital games, software, and gift cards
          </p>
        </div>
      </div>
      <ProductFilter category={dataCat.category} product={dataProduct.product} />
    </div>
  )
}