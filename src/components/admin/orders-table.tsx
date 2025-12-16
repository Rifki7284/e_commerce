// components/admin/order-table.tsx
"use client";

import {
  Eye,
  Package,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import formatDate from "@/lib/formatDate";
import formatPrice from "@/lib/formatPrice";

interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  snapToken: string | null;
  transactionId: string | null;
  paymentMethod: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  orderItems: OrderItem[];
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    slug: string;
  };
  keys: OrderItemKey[];
}

interface OrderItemKey {
  id: number;
  gameKey: {
    code: string;
    status: string;
  };
}

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onViewDetail: (order: Order) => void;
}

export default function OrderTable({
  orders,
  loading,
  onViewDetail,
}: OrderTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; className: string; icon: any }
    > = {
      pending: {
        label: "Pending",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: Clock,
      },
      settlement: {
        label: "Paid",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        icon: CheckCircle,
      },
      capture: {
        label: "Captured",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        icon: CheckCircle,
      },
      cancel: {
        label: "Cancelled",
        className:
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: XCircle,
      },
      expire: {
        label: "Expired",
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        icon: XCircle,
      },
      failure: {
        label: "Failed",
        className:
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      icon: Package,
    };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Items</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Payment
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr className="transition-colors hover:bg-muted/50">
                <td colSpan={8} className="py-6 text-center">
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">
                      Loading orders...
                    </p>
                  </div>
                </td>
              </tr>
            ) : orders.length < 1 ? (
              <tr className="transition-colors hover:bg-muted/50">
                <td colSpan={8} className="py-6 text-center">
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Package className="h-12 w-12 text-muted-foreground/50" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        No orders found
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">#{order.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {order.user.name || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {order.user.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">
                      {order.orderItems.length} item(s)
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-sm">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {order.paymentMethod != "" ? (
                        <>
                          <CreditCard className="w-3 h-3" />
                          order.paymentMethod
                        </>
                      ) : (
                        "-"
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-primary/10 hover:text-primary"
                      onClick={() => onViewDetail(order)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 bg-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
            >
              {/* Header: Order ID & Status */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-bold text-lg">#{order.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Customer Info */}
              <div className="space-y-1 py-2 border-t">
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="font-medium text-sm">
                  {order.user.name || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.user.email}
                </p>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-3 py-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Items</p>
                  <p className="font-medium text-sm">
                    {order.orderItems.length} item(s)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="font-semibold text-sm">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="py-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Payment Method
                </p>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {order.paymentMethod != "" ? (
                    <>
                      <CreditCard className="w-3 h-3" />
                      {order.paymentMethod}
                    </>
                  ) : (
                    "-"
                  )}
                </span>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => onViewDetail(order)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
