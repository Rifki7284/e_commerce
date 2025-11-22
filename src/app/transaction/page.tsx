"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ShoppingBag, ChevronRight } from "lucide-react"
import ClientHeader from "@/components/client/client-header"
import formatPrice from "@/lib/formatPrice"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import ShoppingCartModal from "@/components/store/shopping-cart"
export interface ProductImage {
    id: number;
    url: string;
    productId: number;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    slug: string;
    stock: number;
    categoryId: number;
    images?: ProductImage[];
}

export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    product?: Product;
}

export interface Order {
    id: number;
    userId: number;
    totalAmount: number;
    status: string;
    snapToken?: string | null;
    transactionId?: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    orderItems?: OrderItem[];
    invoiceNumber?: string;
    paymentMethod?: string;
    shippingAddress?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "PAYMENT INCOMPLETE", color: "text-red-800 dark:text-red-400" },
    paid: { label: "ORDER FULFILLED", color: "text-cyan-600 dark:text-cyan-400" },
    processing: { label: "PROCESSING", color: "text-blue-800 dark:text-blue-400" },
    shipped: { label: "SHIPPED", color: "text-purple-800 dark:text-purple-400" },
    delivered: { label: "ORDER FULFILLED", color: "text-cyan-600 dark:text-cyan-400" },
    cancelled: { label: "ORDER CANCELLED", color: "text-red-800 dark:text-red-400" },
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()
    const perPage = 5
    const [totalPage, setTotalPage] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1)

    useEffect(() => {
        fetchOrders()
    }, [currentPage, searchQuery])

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPage) {
            setCurrentPage(page)
        }
    }

    const getVisiblePages = () => {
        const pages: (number | string)[] = []

        if (totalPage <= 5) {
            for (let i = 1; i <= totalPage; i++) pages.push(i)
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPage)
            } else if (currentPage >= totalPage - 2) {
                pages.push(1, "...", totalPage - 3, totalPage - 2, totalPage - 1, totalPage)
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPage)
            }
        }
        return pages
    }

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/transaction?page=${currentPage}&perPage=${perPage}&search=${searchQuery}`)
            const data = await res.json()
            setTotalPage(Math.ceil(data.count / Number(perPage)))
            setOrders(data.transaction)
        } catch (error) {
            console.error("Error fetching orders:", error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusStyle = (status: string) => {
        return statusConfig[status] || statusConfig.pending
    }
    const getOrderTitle = (order: Order) => {
        if (order.orderItems && order.orderItems.length > 0) {
            return order.orderItems[0].product?.name || "Product"
        }
        return "Order"
    }
    const [cartOpen, setCartOpen] = useState(false)
    return (
        <div className="min-h-screen bg-background">
            <ClientHeader onCartOpen={() => setCartOpen(true)} />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center gap-2 sm:gap-3">
                        <ShoppingBag className="text-primary" size={28} />
                        <span className="sm:inline">ORDERS</span>
                    </h1>
                </div>

                {/* Search Bar */}
                <div className="mb-4 sm:mb-6 max-w-full sm:max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                            }}
                            className="pl-9 h-9 w-full"
                        />
                    </div>
                </div>

                {/* Desktop/Laptop Table View - Hidden on tablet and mobile */}
                <div className="hidden md:block bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                                        NO
                                    </th>
                                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                                        DATE
                                    </th>
                                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                                        STATUS
                                    </th>
                                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                                        ORDER TITLE
                                    </th>
                                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                                        ORDER ID
                                    </th>
                                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider hidden lg:table-cell">
                                        PAYMENT
                                    </th>
                                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-bold text-foreground uppercase tracking-wider">
                                        TOTAL
                                    </th>
                                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-bold text-foreground uppercase tracking-wider">
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading && (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center">
                                            <Spinner className="size-6 text-primary inline-block" />
                                        </td>
                                    </tr>
                                )}
                                {!loading && orders.map((order, idx) => {
                                    const statusStyle = getStatusStyle(order.status)
                                    const orderTitle = getOrderTitle(order)

                                    return (
                                        <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-foreground font-medium">
                                                {(idx + 1) + (currentPage - 1) * perPage}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-foreground">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                                                <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${statusStyle.color} bg-opacity-10`}>
                                                    {statusStyle.label}
                                                </span>
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-foreground max-w-xs truncate">
                                                {orderTitle}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                                                {order.transactionId}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-foreground capitalize hidden lg:table-cell">
                                                {order.paymentMethod}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-foreground text-right font-bold">
                                                {formatPrice(order.totalAmount)}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-right text-sm">
                                                <button
                                                    onClick={() => router.push(`/orders/${order.id}`)}
                                                    className="text-primary hover:text-primary/80 font-semibold transition-colors px-3 py-1 rounded hover:bg-primary/10"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        {!loading && orders.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                No orders found
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile & Tablet Card View - Hidden on desktop */}
                <div className="md:hidden space-y-3">
                    {loading && (
                        <div className="flex justify-center py-12">
                            <Spinner className="size-8 text-primary" />
                        </div>
                    )}

                    {!loading && orders.map((order, idx) => {
                        const statusStyle = getStatusStyle(order.status)
                        const orderTitle = getOrderTitle(order)

                        return (
                            <div
                                key={order.id}
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="bg-card border border-border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-medium text-muted-foreground">
                                                #{(idx + 1) + (currentPage - 1) * perPage}
                                            </span>
                                            <span className={`text-xs font-semibold uppercase ${statusStyle.color}`}>
                                                {statusStyle.label}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-foreground text-base line-clamp-1">
                                            {orderTitle}
                                        </h3>
                                    </div>
                                    <ChevronRight className="text-muted-foreground shrink-0 ml-2" size={20} />
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Order ID:</span>
                                        <span className="text-foreground font-medium">{order.transactionId}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Date:</span>
                                        <span className="text-foreground">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Payment:</span>
                                        <span className="text-foreground capitalize">{order.paymentMethod}</span>
                                    </div>

                                    <div className="flex justify-between pt-2 border-t border-border">
                                        <span className="text-muted-foreground font-medium">Total:</span>
                                        <span className="text-foreground font-bold text-base">
                                            {formatPrice(order.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {!loading && orders.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-lg">
                            No orders found
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && orders.length > 0 && (
                    <Pagination className="mt-6">
                        <PaginationContent className="flex-wrap gap-1">
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handlePageChange(currentPage - 1)
                                    }}
                                    className="h-9 text-sm"
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
                                                e.preventDefault()
                                                handlePageChange(page as number)
                                            }}
                                            className="h-9 w-9 text-sm"
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
                                        e.preventDefault()
                                        handlePageChange(currentPage + 1)
                                    }}
                                    className="h-9 text-sm"
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
            {cartOpen && (
                <ShoppingCartModal
                    onClose={() => setCartOpen(false)}
                />
            )}
        </div>
    )
}