"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Package, Calendar, CreditCard, CheckCircle, Clock, XCircle, Download, Key, Copy, Check } from "lucide-react"
import ClientHeader from "@/components/client/client-header"
import formatPrice from "@/lib/formatPrice"
import { Spinner } from "@/components/ui/spinner"
import Image from "next/image"

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

export interface OrderDetail {
    id: number
    userId: number
    totalAmount: number
    status: string
    snapToken?: string | null
    transactionId?: string | null
    paymentMethod?: string
    createdAt: string
    updatedAt: string | null
    orderItems?: OrderItem[]
}

const statusConfig: Record<string, { label: string; color: string; icon: any; bgGradient: string; borderColor: string; emoji: string }> = {
    pending: {
        label: "Pending Payment",
        color: "text-orange-400",
        icon: Clock,
        bgGradient: "from-orange-500/20 to-orange-600/10",
        borderColor: "border-orange-500/30",
        emoji: "⏳"
    },
    paid: {
        label: "Completed",
        color: "text-green-400",
        icon: CheckCircle,
        bgGradient: "from-green-500/20 to-green-600/10",
        borderColor: "border-green-500/30",
        emoji: "✓"
    },
    processing: {
        label: "Processing",
        color: "text-blue-400",
        icon: Package,
        bgGradient: "from-blue-500/20 to-blue-600/10",
        borderColor: "border-blue-500/30",
        emoji: "⚙️"
    },
    shipped: {
        label: "Delivered",
        color: "text-purple-400",
        icon: Download,
        bgGradient: "from-purple-500/20 to-purple-600/10",
        borderColor: "border-purple-500/30",
        emoji: "📦"
    },
    delivered: {
        label: "Completed",
        color: "text-green-400",
        icon: CheckCircle,
        bgGradient: "from-green-500/20 to-green-600/10",
        borderColor: "border-green-500/30",
        emoji: "✓"
    },
    cancelled: {
        label: "Cancelled",
        color: "text-red-400",
        icon: XCircle,
        bgGradient: "from-red-500/20 to-red-600/10",
        borderColor: "border-red-500/30",
        emoji: "✗"
    },
}

export default function OrderDetailPage() {
    const [order, setOrder] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [copiedId, setCopiedId] = useState(false)
    const router = useRouter()
    const { slug } = useParams()

    useEffect(() => {
        fetchOrderDetail()
    }, [])

    const fetchOrderDetail = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/transaction/${slug}`)
            const response = await res.json()
            setOrder(response.data)
        } catch (error) {
            console.error("Error fetching order detail:", error)
        } finally {
            setLoading(false)
        }
    }

    const [cartOpen, setCartOpen] = useState(false)

    const getStatusConfig = (status: string) => {
        return statusConfig[status] || statusConfig.pending
    }

    const copyTransactionId = () => {
        if (order?.transactionId) {
            navigator.clipboard.writeText(order.transactionId)
            setCopiedId(true)
            setTimeout(() => setCopiedId(false), 2000)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
                <ClientHeader onCartOpen={() => setCartOpen(true)} />
                <div className="container mx-auto px-4 py-20 flex items-center justify-center">
                    <div className="text-center">
                        <Spinner className="size-12 text-blue-500 mx-auto mb-4" />
                        <p className="text-slate-400">Loading order details...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
                <ClientHeader onCartOpen={() => setCartOpen(true)} />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package size={40} className="text-slate-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
                    <p className="text-slate-400 mb-6">The order you're looking for doesn't exist</p>
                    <button
                        onClick={() => router.push("/orders")}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                        <ArrowLeft size={18} />
                        Back to Orders
                    </button>
                </div>
            </div>
        )
    }

    const statusInfo = getStatusConfig(order.status)
    const StatusIcon = statusInfo.icon

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
            <ClientHeader onCartOpen={() => setCartOpen(true)} />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/orders")}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">Back to Library</span>
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Order Details</h1>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400">Order ID:</span>
                        <span className="font-mono font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                            {order.transactionId}
                        </span>
                        <button
                            onClick={copyTransactionId}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
                            title="Copy Order ID"
                        >
                            {copiedId ? (
                                <Check size={16} className="text-green-400" />
                            ) : (
                                <Copy size={16} className="text-slate-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Status Card */}
                <div className={`bg-linear-to-br ${statusInfo.bgGradient} backdrop-blur-sm border-2 ${statusInfo.borderColor} rounded-xl p-6 mb-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 text-8xl opacity-5">{statusInfo.emoji}</div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 bg-slate-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center border border-slate-700">
                            <StatusIcon size={28} className={statusInfo.color} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-semibold mb-1">Order Status</p>
                            <p className={`text-2xl sm:text-3xl font-black ${statusInfo.color}`}>
                                {statusInfo.label}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Key size={20} className="text-blue-400" />
                                    Digital Products
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {order.orderItems?.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-700/30 transition-colors border border-slate-700/50">
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-slate-950 rounded-lg overflow-hidden border border-slate-700">
                                            {item.product?.images && item.product.images.length > 0 ? (
                                                <Image
                                                    src={item.product.images[0].url}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Key className="text-slate-600" size={32} />
                                                </div>
                                            )}
                                            {/* Digital Badge */}
                                            <div className="absolute bottom-1 left-1 bg-blue-500/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-bold text-white">
                                                KEY
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white text-base sm:text-lg mb-2 line-clamp-2">
                                                {item.product?.name}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm mb-2">
                                                <span className="text-slate-400">
                                                    Qty: <span className="font-bold text-white">{item.quantity}</span>
                                                </span>
                                                <span className="text-slate-400">•</span>
                                                <span className="text-blue-400 font-semibold flex items-center gap-1">
                                                    <Download size={14} />
                                                    Instant Delivery
                                                </span>
                                            </div>
                                            <p className="text-lg font-black text-white">
                                                {formatPrice(item.price)}
                                            </p>
                                        </div>
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Subtotal</p>
                                            <p className="text-xl font-black text-white">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Download Button */}
                                {(order.status === 'paid' || order.status === 'delivered') && (
                                    <button className="w-full py-4 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30">
                                        <Download size={20} />
                                        Download All Keys
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Order Summary - Mobile */}
                        <div className="lg:hidden bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700">
                                <h2 className="text-lg font-bold text-white">Order Summary</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-3">
                                    {order.orderItems?.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-slate-400">
                                                {item.product?.name} x{item.quantity}
                                            </span>
                                            <span className="font-bold text-white">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t-2 border-slate-700 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-white">Total</span>
                                        <span className="text-2xl font-black bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                            {formatPrice(order.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Info */}
                    <div className="space-y-6">
                        {/* Order Summary - Desktop */}
                        <div className="hidden lg:block bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700">
                                <h2 className="text-lg font-bold text-white">Order Summary</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-3">
                                    {order.orderItems?.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm gap-2">
                                            <span className="text-slate-400 line-clamp-1">
                                                {item.product?.name} x{item.quantity}
                                            </span>
                                            <span className="font-bold text-white whitespace-nowrap">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t-2 border-slate-700 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-white">Total</span>
                                        <span className="text-2xl font-black bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                            {formatPrice(order.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <CreditCard size={20} className="text-purple-400" />
                                    Payment Info
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-slate-400 mb-2 uppercase tracking-wide">Payment Method</p>
                                    <p className="text-base font-bold text-white capitalize bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                                        {order.paymentMethod || "N/A"}
                                    </p>
                                </div>
                                <div className="border-t border-slate-700 pt-4">
                                    <p className="text-sm text-slate-400 mb-2 uppercase tracking-wide">Transaction ID</p>
                                    <p className="text-sm font-mono font-semibold text-slate-300 break-all bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                                        {order.transactionId}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Date Info */}
                        <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Calendar size={20} className="text-blue-400" />
                                    Date Info
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-slate-400 mb-2 uppercase tracking-wide">Order Date</p>
                                    <p className="text-base font-bold text-white">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </p>
                                </div>
                                {order.updatedAt && (
                                    <div className="border-t border-slate-700 pt-4">
                                        <p className="text-sm text-slate-400 mb-2 uppercase tracking-wide">Last Updated</p>
                                        <p className="text-base font-bold text-white">
                                            {new Date(order.updatedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {new Date(order.updatedAt).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}