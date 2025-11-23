"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Package, Calendar, CreditCard, MapPin, CheckCircle, Clock, XCircle, Truck, ShoppingBag } from "lucide-react"
import ClientHeader from "@/components/client/client-header"
import formatPrice from "@/lib/formatPrice"
import { Spinner } from "@/components/ui/spinner"
import Image from "next/image"

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

export interface OrderDetail {
    id: number;
    userId: number;
    totalAmount: number;
    status: string;
    snapToken?: string | null;
    transactionId?: string | null;
    paymentMethod?: string;
    createdAt: string;
    updatedAt: string | null;
    orderItems?: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
    pending: {
        label: "Payment Incomplete",
        color: "text-red-600 dark:text-red-400",
        icon: Clock,
        bgColor: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
    },
    paid: {
        label: "Order Fulfilled",
        color: "text-cyan-600 dark:text-cyan-400",
        icon: CheckCircle,
        bgColor: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800"
    },
    processing: {
        label: "Processing",
        color: "text-blue-600 dark:text-blue-400",
        icon: Package,
        bgColor: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
    },
    shipped: {
        label: "Shipped",
        color: "text-purple-600 dark:text-purple-400",
        icon: Truck,
        bgColor: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800"
    },
    delivered: {
        label: "Order Fulfilled",
        color: "text-cyan-600 dark:text-cyan-400",
        icon: CheckCircle,
        bgColor: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800"
    },
    cancelled: {
        label: "Order Cancelled",
        color: "text-red-600 dark:text-red-400",
        icon: XCircle,
        bgColor: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
    },
}

export default function OrderDetailPage() {
    const [order, setOrder] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const { slug } = useParams();

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

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <ClientHeader onCartOpen={() => setCartOpen(true)} />
                <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                    <Spinner className="size-12 text-primary" />
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background">
                <ClientHeader onCartOpen={() => setCartOpen(true)} />
                <div className="container mx-auto px-4 py-16 text-center">
                    <p className="text-muted-foreground text-lg">Order not found</p>
                </div>
            </div>
        )
    }

    const statusInfo = getStatusConfig(order.status)
    const StatusIcon = statusInfo.icon

    return (
        <div className="min-h-screen bg-background">
            <ClientHeader onCartOpen={() => setCartOpen(true)} />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/orders")}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Orders</span>
                </button>

                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Order Details</h1>
                    <p className="text-muted-foreground">Order ID: <span className="font-mono font-semibold text-foreground">{order.transactionId}</span></p>
                </div>

                {/* Status Card */}
                <div className={`${statusInfo.bgColor} border-2 rounded-2xl p-4 sm:p-6 mb-6`}>
                    <div className="flex items-center gap-3">
                        <div className={`${statusInfo.color} bg-background rounded-full p-3`}>
                            <StatusIcon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Order Status</p>
                            <p className={`text-xl sm:text-2xl font-bold ${statusInfo.color}`}>
                                {statusInfo.label}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-muted/50 px-4 sm:px-6 py-4 border-b border-border">
                                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-primary" />
                                    Order Items
                                </h2>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                                {order.orderItems?.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-background rounded-lg overflow-hidden border border-border">
                                            {item.product?.images && item.product.images.length > 0 ? (
                                                <Image
                                                    src={item.product.images[0].url}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="text-muted-foreground" size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground text-base sm:text-lg mb-1 line-clamp-2">
                                                {item.product?.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Quantity: <span className="font-semibold text-foreground">{item.quantity}</span>
                                            </p>
                                            <p className="text-base sm:text-lg font-bold text-primary">
                                                {formatPrice(item.price)}
                                            </p>
                                        </div>
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm text-muted-foreground mb-1">Subtotal</p>
                                            <p className="text-lg font-bold text-foreground">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary - Mobile */}
                        <div className="lg:hidden bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-muted/50 px-4 sm:px-6 py-4 border-b border-border">
                                <h2 className="text-lg font-bold text-foreground">Order Summary</h2>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                                <div className="space-y-3">
                                    {order.orderItems?.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {item.product?.name} x{item.quantity}
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t-2 border-border pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-foreground">Total</span>
                                        <span className="text-2xl font-bold text-primary">
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
                        <div className="hidden lg:block bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-muted/50 px-6 py-4 border-b border-border">
                                <h2 className="text-lg font-bold text-foreground">Order Summary</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-3">
                                    {order.orderItems?.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground line-clamp-1">
                                                {item.product?.name} x{item.quantity}
                                            </span>
                                            <span className="font-semibold text-foreground ml-2">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t-2 border-border pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-foreground">Total</span>
                                        <span className="text-2xl font-bold text-primary">
                                            {formatPrice(order.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-muted/50 px-4 sm:px-6 py-4 border-b border-border">
                                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <CreditCard size={20} className="text-primary" />
                                    Payment Info
                                </h2>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                                    <p className="text-base font-semibold text-foreground capitalize">
                                        {order.paymentMethod || "N/A"}
                                    </p>
                                </div>
                                <div className="border-t border-border pt-4">
                                    <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                                    <p className="text-sm font-mono font-semibold text-foreground break-all">
                                        {order.transactionId}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Date Info */}
                        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-muted/50 px-4 sm:px-6 py-4 border-b border-border">
                                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <Calendar size={20} className="text-primary" />
                                    Date Info
                                </h2>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                                    <p className="text-base font-semibold text-foreground">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </p>
                                </div>
                                {order.updatedAt && (
                                    <div className="border-t border-border pt-4">
                                        <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                                        <p className="text-base font-semibold text-foreground">
                                            {new Date(order.updatedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
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