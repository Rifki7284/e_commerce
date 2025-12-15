import ClientHeader from "@/components/client/client-header";
import OrderList from "@/components/order/order-list";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <ClientHeader />
      <OrderList />
    </div>
  );
}
