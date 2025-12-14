import ProductDetail from "@/components/product/product-detail";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
  if (!session) {
    redirect("/");
  }
  if (session?.user.role == "Admin") {
    redirect("/admin/dashbaord");
  }

  const { slug } = await params;
  const h = await headers();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const res = await fetch(`${baseUrl}/api/products/detail/${slug}`, {
    cache: "no-store",
  });
  const data = await res.json();
  const resReview = await fetch(
    `${baseUrl}/api/reviews/me?productId=${data.product[0].id}`,
    {
      cache: "no-store",
      credentials: "include",
      headers: {
        Cookie: h.get("cookie") ?? "",
      },
    }
  );
  const dataReview = await resReview.json();
  return (
    <>
      <ProductDetail
        existingReview={dataReview}
        product={data.product[0]}
        slug={slug}
      />
    </>
  );
}
