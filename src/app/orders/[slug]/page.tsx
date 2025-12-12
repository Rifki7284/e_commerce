"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Package, Calendar, CreditCard, CheckCircle, Clock, XCircle, Download, Key, Copy, Check, Eye, EyeOff, Shield } from "lucide-react"
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

export interface GameKey {
    id: number
    code: string
    productId: number
    status: string
    createdAt: string
    soldAt: string
}

export interface OrderItemKey {
    id: number
    orderItemId: number
    gameKeyId: number
    gameKey: GameKey
}

export interface OrderItem {
    id: number
    orderId: number
    productId: number
    quantity: number
    price: number
    product?: Product
    keys?: OrderItemKey[]
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

const statusConfig: Record<string, { label: string; color: string; icon: any; bgGradient: string; borderColor: string }> = {
    pending: {
        label: "Pending Payment",
        color: "text-amber-400",
        icon: Clock,
        bgGradient: "from-amber-500/10 via-orange-500/5 to-transparent",
        borderColor: "border-amber-500/20"
    },
    paid: {
        label: "Payment Successful",
        color: "text-emerald-400",
        icon: CheckCircle,
        bgGradient: "from-emerald-500/10 via-green-500/5 to-transparent",
        borderColor: "border-emerald-500/20"
    },
    processing: {
        label: "Processing Order",
        color: "text-blue-400",
        icon: Package,
        bgGradient: "from-blue-500/10 via-cyan-500/5 to-transparent",
        borderColor: "border-blue-500/20"
    },
    shipped: {
        label: "Keys Delivered",
        color: "text-purple-400",
        icon: Download,
        bgGradient: "from-purple-500/10 via-violet-500/5 to-transparent",
        borderColor: "border-purple-500/20"
    },
    delivered: {
        label: "Completed",
        color: "text-emerald-400",
        icon: CheckCircle,
        bgGradient: "from-emerald-500/10 via-green-500/5 to-transparent",
        borderColor: "border-emerald-500/20"
    },
    cancelled: {
        label: "Order Cancelled",
        color: "text-red-400",
        icon: XCircle,
        bgGradient: "from-red-500/10 via-rose-500/5 to-transparent",
        borderColor: "border-red-500/20"
    }
}

export default function OrderDetailPage() {
    const [order, setOrder] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [copiedId, setCopiedId] = useState(false)
    const [copiedKeys, setCopiedKeys] = useState<{[key: number]: boolean}>({})
    const [revealedKeys, setRevealedKeys] = useState<{[key: number]: boolean}>({})
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

    const copyKey = (keyCode: string, keyId: number) => {
        navigator.clipboard.writeText(keyCode)
        setCopiedKeys(prev => ({ ...prev, [keyId]: true }))
        setTimeout(() => {
            setCopiedKeys(prev => ({ ...prev, [keyId]: false }))
        }, 2000)
    }

    const toggleRevealKey = (keyId: number) => {
        setRevealedKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
    }

    const downloadAllKeys = () => {
        if (!order?.orderItems) return
        
        let keysText = `Order ID: ${order.transactionId}\n`
        keysText += `Purchase Date: ${new Date(order.createdAt).toLocaleDateString()}\n\n`
        keysText += `===========================================\n`
        keysText += `PRODUCT KEYS\n`
        keysText += `===========================================\n\n`

        order.orderItems.forEach(item => {
            keysText += `Product: ${item.product?.name}\n`
            keysText += `-------------------------------------------\n`
            item.keys?.forEach((key, index) => {
                keysText += `Key ${index + 1}: ${key.gameKey.code}\n`
            })
            keysText += `\n`
        })

        const blob = new Blob([keysText], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `keys-${order.transactionId}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
                <ClientHeader />
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
                <ClientHeader />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
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
    const isPaidOrCompleted = order.status === 'paid' || order.status === 'delivered'

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
            <ClientHeader />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/orders")}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">Back to Orders</span>
                </button>

                {/* Header with Order ID */}
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-black text-transparent mb-4 bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
                        Order Details
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50">
                            <span className="text-slate-400 text-sm">Order ID:</span>
                            <span className="font-mono font-bold text-white">
                                {order.transactionId}
                            </span>
                        </div>
                        <button
                            onClick={copyTransactionId}
                            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors border border-slate-700/50"
                            title="Copy Order ID"
                        >
                            {copiedId ? (
                                <Check size={18} className="text-green-400" />
                            ) : (
                                <Copy size={18} className="text-slate-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Status Banner */}
                <div className={`bg-linear-to-r ${statusInfo.bgGradient} backdrop-blur-sm border ${statusInfo.borderColor} rounded-2xl p-6 mb-8 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-linear-to-r from-slate-900/50 to-transparent"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center border border-slate-700/50 shadow-lg">
                            <StatusIcon size={32} className={statusInfo.color} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-400 font-medium mb-1">Order Status</p>
                            <p className={`text-2xl sm:text-3xl font-black ${statusInfo.color}`}>
                                {statusInfo.label}
                            </p>
                            {isPaidOrCompleted && (
                                <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                                    <Shield size={14} className="text-green-400" />
                                    Your keys are ready to use
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Products & Keys */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Products with Keys */}
                        {order.orderItems?.map((item) => (
                            <div key={item.id} className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
                                {/* Product Header */}
                                <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <Key size={20} className="text-blue-400" />
                                        <h2 className="text-lg font-bold text-white">Digital Product</h2>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="p-6">
                                    <div className="flex gap-4 mb-6 p-4 bg-slate-900/30 rounded-xl border border-slate-700/30">
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-slate-950 rounded-lg overflow-hidden border border-slate-700/50">
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
                                            <div className="absolute bottom-1 left-1 bg-blue-500 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold text-white">
                                                DIGITAL
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
                                                {item.product?.name}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm mb-2">
                                                <span className="text-slate-400">
                                                    Quantity: <span className="font-bold text-white">{item.quantity}</span>
                                                </span>
                                                <span className="text-slate-400">•</span>
                                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                                    <Download size={14} />
                                                    Instant Access
                                                </span>
                                            </div>
                                            <p className="text-xl font-black text-white">
                                                {formatPrice(item.price)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Product Keys Section */}
                                    {isPaidOrCompleted && item.keys && item.keys.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                    <Key size={18} className="text-emerald-400" />
                                                    Your Product Keys
                                                </h3>
                                                <span className="text-sm text-slate-400 bg-slate-900/50 px-3 py-1 rounded-lg">
                                                    {item.keys.length} {item.keys.length === 1 ? 'Key' : 'Keys'}
                                                </span>
                                            </div>

                                            {item.keys.map((key, index) => (
                                                <div key={key.id} className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-900/60 transition-all">
                                                    <div className="flex items-center justify-between gap-3 mb-3">
                                                        <span className="text-sm font-semibold text-slate-400">
                                                            Key #{index + 1}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => toggleRevealKey(key.id)}
                                                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                                                title={revealedKeys[key.id] ? "Hide key" : "Reveal key"}
                                                            >
                                                                {revealedKeys[key.id] ? (
                                                                    <EyeOff size={16} className="text-slate-400" />
                                                                ) : (
                                                                    <Eye size={16} className="text-slate-400" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => copyKey(key.gameKey.code, key.id)}
                                                                className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg transition-all text-sm font-semibold"
                                                                title="Copy key"
                                                            >
                                                                {copiedKeys[key.id] ? (
                                                                    <>
                                                                        <Check size={14} />
                                                                        Copied!
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy size={14} />
                                                                        Copy
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="font-mono text-lg font-bold text-white bg-slate-950/50 px-4 py-3 rounded-lg border border-slate-700/50 break-all">
                                                        {revealedKeys[key.id] ? key.gameKey.code : '••••-••••-••••-••••'}
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-2">
                                                        Delivered: {new Date(key.gameKey.soldAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            ))}

                                            {/* Download Keys Button */}
                                            <button 
                                                onClick={downloadAllKeys}
                                                className="w-full mt-4 py-3 bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                            >
                                                <Download size={20} />
                                                Download All Keys as File
                                            </button>
                                        </div>
                                    )}

                                    {!isPaidOrCompleted && (
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                            <p className="text-amber-400 text-sm font-medium flex items-center gap-2">
                                                <Clock size={16} />
                                                Keys will be available once payment is confirmed
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column - Order Info */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
                            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50">
                                <h2 className="text-lg font-bold text-white">Order Summary</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-3">
                                    {order.orderItems?.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm gap-2">
                                            <span className="text-slate-400 line-clamp-2">
                                                {item.product?.name} ×{item.quantity}
                                            </span>
                                            <span className="font-bold text-white whitespace-nowrap">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t-2 border-slate-700/50 pt-4">
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
                        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
                            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <CreditCard size={20} className="text-purple-400" />
                                    Payment Details
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Payment Method</p>
                                    <p className="text-base font-bold text-white capitalize bg-slate-900/40 px-4 py-2.5 rounded-lg border border-slate-700/50">
                                        {order.paymentMethod || "N/A"}
                                    </p>
                                </div>
                                <div className="border-t border-slate-700/50 pt-4">
                                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Transaction ID</p>
                                    <p className="text-sm font-mono font-semibold text-slate-300 break-all bg-slate-900/40 px-4 py-2.5 rounded-lg border border-slate-700/50">
                                        {order.transactionId}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Date Info */}
                        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
                            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Calendar size={20} className="text-blue-400" />
                                    Timeline
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Order Date</p>
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
                                    <div className="border-t border-slate-700/50 pt-4">
                                        <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Last Updated</p>
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