// components/admin/order-detail-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import formatDate from "@/lib/formatDate";
import formatPrice from "@/lib/formatPrice";
import { CheckCircle, Clock, Package, XCircle } from "lucide-react";
import { JSX } from "react";

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
  keys?: OrderItemKey[];
}

interface OrderItemKey {
  id: number;
  gameKey: {
    code: string;
    status: string;
  };
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (orderId: number, newStatus: string) => void;
}
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
export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
}: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Order Details - #{order.id}
          </DialogTitle>
          <DialogDescription>
            Complete information about this order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Customer Information</h3>
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg space-y-1">
              <p className="text-sm">
                <span className="font-medium">Name:</span>{" "}
                {order.user.name || "Unknown"}
              </p>
              <p className="text-sm break-all">
                <span className="font-medium">Email:</span> {order.user.email}
              </p>
            </div>
          </div>

          {/* Order Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Order Information</h3>
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm">Status:</span>
                {getStatusBadge(order.status)}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm">Payment Method:</span>
                <span className="text-sm font-medium">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm">Transaction ID:</span>
                <span className="text-sm font-mono break-all">
                  {order.transactionId || "-"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-sm">Order Date:</span>
                <span className="text-sm">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Order Items - Desktop */}
          <div className="space-y-2 hidden sm:block">
            <h3 className="font-semibold text-sm">Order Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      Product
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-medium">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium">
                      Price
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 font-medium text-sm">
                        {item.product.name}
                      </td>
                      <td className="px-4 py-2 text-center text-sm">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 text-right text-sm">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/30">
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-right font-semibold"
                    >
                      Total:
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-lg">
                      {formatPrice(order.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Items - Mobile */}
          <div className="space-y-2 sm:hidden">
            <h3 className="font-semibold text-sm">Order Items</h3>
            <div className="space-y-3">
              {order.orderItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 space-y-2">
                  <p className="font-medium text-sm">{item.product.name}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium ml-2">{item.quantity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium ml-2">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Subtotal:
                      </span>
                      <span className="font-semibold text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Keys */}
          {order.orderItems.some(
            (item) => item.keys && item.keys.length > 0
          ) && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Game Keys</h3>
              <div className="space-y-3">
                {order.orderItems.map(
                  (item) =>
                    item.keys &&
                    item.keys.length > 0 && (
                      <div
                        key={item.id}
                        className="bg-muted/50 p-4 rounded-lg space-y-2"
                      >
                        <p className="font-medium text-sm">
                          {item.product.name}
                        </p>
                        <div className="space-y-1">
                          {item.keys.map((keyItem) => (
                            <div
                              key={keyItem.id}
                              className="flex items-center justify-between bg-background p-2 rounded border"
                            >
                              <code className="text-sm font-mono">
                                {keyItem.gameKey.code}
                              </code>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                                {keyItem.gameKey.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {/* Update Status */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Update Status</h3>
            <div className="flex gap-2">
              <Select
                defaultValue={order.status}
                onValueChange={(value) => onUpdateStatus(order.id, value)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="settlement">Paid</SelectItem>
                  <SelectItem value="cancel">Cancelled</SelectItem>
                  <SelectItem value="expire">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
