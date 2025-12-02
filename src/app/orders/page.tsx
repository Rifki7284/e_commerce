"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ShoppingBag, ChevronRight, Package, Download, Key } from "lucide-react"
import ClientHeader from "@/components/client/client-header"
import formatPrice from "@/lib/formatPrice"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import ShoppingCartModal from "@/components/store/shopping-cart"

export interface ProductImage {
    id: number
    url: string
    productId: number
}

export interface Product {
    id: number
    name: string
    price: number
    description: string
    slug: string
    stock: number
    categoryId: number
    images?: ProductImage[]
}

export interface OrderItem {
    id: number
    orderId: number
    productId: number
    quantity: number
    price: number
    product?: Product
}

export interface Order {
    id: number
    userId: number
    totalAmount: number
    status: string
    snapToken?: string | null
    transactionId?: string | null
    createdAt: Date
    updatedAt: Date | null
    orderItems?: OrderItem[]
    invoiceNumber?: string
    paymentMethod?: string
    shippingAddress?: string
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
    pending: { 
        label: "Pending Payment", 
        color: "text-orange-400", 
        bgColor: "bg-orange-500/10 border-orange-500/30",
        icon: "⏳"
    },
    paid: { 
        label: "Completed", 
        color: "text-green-400", 
        bgColor: "bg-green-500/10 border-green-500/30",
        icon: "✓"
    },
    processing: { 
        label: "Processing", 
        color: "text-blue-400", 
        bgColor: "bg-blue-500/10 border-blue-500/30",
        icon: "⚙️"
    },
    shipped: { 
        label: "Delivered", 
        color: "text-purple-400", 
        bgColor: "bg-purple-500/10 border-purple-500/30",
        icon: "📦"
    },
    delivered: { 
        label: "Completed", 
        color: "text-green-400", 
        bgColor: "bg-green-500/10 border-green-500/30",
        icon: "✓"
    },
    cancelled: { 
        label: "Cancelled", 
        color: "text-red-400", 
        bgColor: "bg-red-500/10 border-red-500/30",
        icon: "✗"
    },
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()
    const perPage = 5
    const [totalPage, setTotalPage] = useState<number>(0)
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <ClientHeader onCartOpen={() => setCartOpen(true)} />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Package className="text-white" size={24} />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white">
                            My Library
                        </h1>
                    </div>
                    <p className="text-slate-400 text-sm sm:text-base ml-[52px]">View your digital purchases and downloads</p>
                </div>

                {/* Search Bar */}
                <div className="mb-6 max-w-full sm:max-w-md">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-800 transition-all"
                        />
                    </div>
                </div>

                {/* Desktop/Laptop Table View */}
                <div className="hidden md:block bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-800/50 border-b border-slate-700">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        No
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider hidden lg:table-cell">
                                        Payment
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {loading && (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center">
                                            <Spinner className="size-8 text-blue-500 inline-block" />
                                        </td>
                                    </tr>
                                )}
                                {!loading && orders.map((order, idx) => {
                                    const statusStyle = getStatusStyle(order.status)
                                    const orderTitle = getOrderTitle(order)

                                    return (
                                        <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">
                                                {(idx + 1) + (currentPage - 1) * perPage}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white">
                                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-lg border ${statusStyle.bgColor} ${statusStyle.color}`}>
                                                    <span>{statusStyle.icon}</span>
                                                    {statusStyle.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white font-medium max-w-xs">
                                                <div className="flex items-center gap-2">
                                                    <Key size={16} className="text-blue-400 flex-shrink-0" />
                                                    <span className="truncate">{orderTitle}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                                                {order.transactionId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 capitalize hidden lg:table-cell">
                                                {order.paymentMethod}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right font-bold">
                                                {formatPrice(order.totalAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button
                                                    onClick={() => router.push(`/orders/${order.transactionId}`)}
                                                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold transition-colors px-3 py-2 rounded-lg hover:bg-blue-500/10"
                                                >
                                                    <Download size={16} />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        {!loading && orders.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package size={40} className="text-slate-600" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">No Orders Yet</h3>
                                <p className="text-slate-400 mb-6">Start shopping to see your orders here</p>
                                <button
                                    onClick={() => router.push('/product')}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
                                >
                                    <ShoppingBag size={18} />
                                    Browse Games
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile & Tablet Card View */}
                <div className="md:hidden space-y-4">
                    {loading && (
                        <div className="flex justify-center py-16">
                            <Spinner className="size-10 text-blue-500" />
                        </div>
                    )}

                    {!loading && orders.map((order, idx) => {
                        const statusStyle = getStatusStyle(order.status)
                        const orderTitle = getOrderTitle(order)

                        return (
                            <div
                                key={order.id}
                                onClick={() => router.push(`/orders/${order.transactionId}`)}
                                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-lg p-4 hover:border-blue-500/50 transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold text-slate-400">
                                                #{(idx + 1) + (currentPage - 1) * perPage}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 text-xs font-bold uppercase px-2 py-1 rounded-md border ${statusStyle.bgColor} ${statusStyle.color}`}>
                                                <span className="text-xs">{statusStyle.icon}</span>
                                                {statusStyle.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Key size={16} className="text-blue-400 flex-shrink-0" />
                                            <h3 className="font-bold text-white text-base line-clamp-1">
                                                {orderTitle}
                                            </h3>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-400 shrink-0 ml-2" size={20} />
                                </div>

                                <div className="space-y-2.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Order ID:</span>
                                        <span className="text-slate-300 font-mono text-xs">{order.transactionId}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Date:</span>
                                        <span className="text-white font-medium">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Payment:</span>
                                        <span className="text-white capitalize font-medium">{order.paymentMethod}</span>
                                    </div>

                                    <div className="flex justify-between pt-3 border-t border-slate-700">
                                        <span className="text-slate-400 font-bold">Total:</span>
                                        <span className="text-white font-black text-lg">
                                            {formatPrice(order.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {!loading && orders.length === 0 && (
                        <div className="text-center py-16 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package size={40} className="text-slate-600" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">No Orders Yet</h3>
                            <p className="text-slate-400 mb-6">Start shopping to see your orders here</p>
                            <button
                                onClick={() => router.push('/product')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
                            >
                                <ShoppingBag size={18} />
                                Browse Games
                            </button>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && orders.length > 0 && (
                    <div className="mt-8">
                        <Pagination>
                            <PaginationContent className="flex-wrap gap-2">
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handlePageChange(currentPage - 1)
                                        }}
                                        className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                                    />
                                </PaginationItem>

                                {getVisiblePages().map((page, index) => (
                                    <PaginationItem key={index}>
                                        {page === "..." ? (
                                            <PaginationEllipsis className="text-slate-400" />
                                        ) : (
                                            <PaginationLink
                                                href="#"
                                                isActive={page === currentPage}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handlePageChange(page as number)
                                                }}
                                                className={page === currentPage 
                                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500" 
                                                    : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"}
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
                                        className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white"
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
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