"use client";

import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import formatDate from "@/lib/formatDate";
import OrderTable from "@/components/admin/orders-table";
import formatPrice from "@/lib/formatPrice";
import OrderDetailModal from "@/components/admin/order-detail-modal";

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [perPage, setPerPage] = useState<string>("5");
  const [totalPage, setTotalPage] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPage) {
      setCurrentPage(page);
    }
  };

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    if (totalPage <= 5) {
      for (let i = 1; i <= totalPage; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPage);
      } else if (currentPage >= totalPage - 2) {
        pages.push(
          1,
          "...",
          totalPage - 3,
          totalPage - 2,
          totalPage - 1,
          totalPage
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPage
        );
      }
    }
    return pages;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
        icon: any;
      }
    > = {
      pending: { label: "Pending", variant: "secondary", icon: Clock },
      settlement: { label: "Paid", variant: "default", icon: CheckCircle },
      capture: { label: "Captured", variant: "default", icon: CheckCircle },
      cancel: { label: "Cancelled", variant: "destructive", icon: XCircle },
      expire: { label: "Expired", variant: "destructive", icon: XCircle },
      failure: { label: "Failed", variant: "destructive", icon: XCircle },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "outline" as const,
      icon: Package,
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update order status");

      await getOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      alert("Order status updated successfully");
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    getOrders();
  }, [currentPage, search, perPage, statusFilter]);

  const getOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        perPage: perPage,
        search: search,
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders);
      setTotalPage(Math.ceil(data.count / Number(perPage)));
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Orders Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            View and manage customer orders
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Show entries section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              Show
            </p>
            <Select value={perPage} onValueChange={setPerPage}>
              <SelectTrigger className="w-[70px] h-9">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Value</SelectLabel>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              entries
            </p>
          </div>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="settlement">Paid</SelectItem>
                <SelectItem value="cancel">Cancelled</SelectItem>
                <SelectItem value="expire">Expired</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Search section */}
        <div className="w-full sm:w-auto sm:max-w-xs">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by ID, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-full"
            />
          </div>
        </div>
      </div>
      <OrderTable
        orders={orders}
        loading={loading}
        onViewDetail={handleViewDetail}
      />

      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}
            />
          </PaginationItem>

          {getVisiblePages().map((page, index) => (
            <PaginationItem key={index}>
              {page === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page as number);
                  }}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
