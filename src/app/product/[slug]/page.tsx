import ClientHeader from "@/components/client/client-header";
import ProductDetail from "@/components/product/product-detail";
import { auth } from "@/lib/auth";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

type Props = {
  params: { slug: string };
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const res = await fetch(`${baseUrl}/api/products/detail/${slug}`, {
    cache: "no-store",
  });

  const data = await res.json();
  const product = data.product?.[0];

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan | GameKeys Indonesia",
      description: "Produk yang Anda cari tidak ditemukan.",
    };
  }

  const name = product.name;
  const desc =
    product.description?.slice(0, 160) ||
    `Beli ${name} original harga terbaik di GameKeys Indonesia.`;

  const price = product.price;
  const category = product.categories?.name;
  const imageUrl = product.images?.[0]?.url;

  const keywords = [
    `${name} murah`,
    `beli ${name} original`,
    `${name} steam key`,
    `${name} digital key`,
    `${name} indonesia`,
    `${category} murah`,
    "steam key murah",
    "game pc murah",
    "game original indonesia",
  ];

  return {
    title: `${name} – Harga ${price.toLocaleString(
      "id-ID"
    )} | GameKeys Indonesia`,
    description: desc,
    keywords,

    openGraph: {
      title: `${name} – Harga ${price.toLocaleString("id-ID")}`,
      description: desc,
      url: `${baseUrl}/product/${slug}`,
      siteName: "GameKeys Indonesia",
      type: "website",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: name,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title: name,
      description: desc,
      images: imageUrl ? [imageUrl] : undefined,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (session?.user.role == "Admin") {
    redirect("/admin/dashbaord");
  }
  console.log(session);
  const { slug } = await params;
  const h = await headers();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const res = await fetch(`${baseUrl}/api/products/detail/${slug}`);
  const data = await res.json();
  const product = data.product[0];
  const resReview = await fetch(
    `${baseUrl}/api/reviews/me?productId=${data.product[0].id}`,
    {
      credentials: "include",
      headers: {
        Cookie: h.get("cookie") ?? "",
      },
    }
  );
  const dataReview = await resReview.json();
  const referer = h.get("referer") ?? "/home";

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
        <ClientHeader />
        {/* Background Effects */}
        <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyMiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20 pointer-events-none"></div>
        <div className="fixed top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="fixed bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link
              href={referer}
              className="hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              Back
            </Link>
            <span>/</span>
            <span>Product</span>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </div>

          {/* Product Details */}
          <ProductDetail
            product={product}
            existingReview={dataReview}
            session={session?.user}
          />
        </div>
      </div>
    </>
  );
}
