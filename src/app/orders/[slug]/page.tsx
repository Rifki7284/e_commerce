import ClientHeader from "@/components/client/client-header";
import Link from "next/link";
import OrderDetail from "@/components/order/order-detail";
import { ArrowLeft, Package } from "lucide-react";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const res = await fetch(`${baseUrl}/api/transaction/${slug}`, {
    cache: "no-store",
  });
  const data = await res.json();

  //   if (loading) {
  //     return (
  //       <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
  //         <ClientHeader />
  //         <div className="container mx-auto px-4 py-20 flex items-center justify-center">
  //           <div className="text-center">
  //             <Spinner className="size-12 text-blue-500 mx-auto mb-4" />
  //             <p className="text-slate-400">Loading order details...</p>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  if (!data.data) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
        <ClientHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={40} className="text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Order Not Found
          </h2>
          <p className="text-slate-400 mb-6">
            The order you're looking for doesn't exist
          </p>
          <Link
            href={"/orders"}
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <ArrowLeft size={18} />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <ClientHeader />
      <OrderDetail order={data.data} />
    </div>
  );
}
