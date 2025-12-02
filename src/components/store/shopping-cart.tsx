"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Plus, Minus, Trash2, ShoppingBag, Loader2, Key, Download, Shield } from "lucide-react"
import formatPrice from "@/lib/formatPrice"

interface ShoppingCartProps {
  onClose: () => void
}

declare global {
  interface Window {
    snap: any
  }
}

export default function ShoppingCart({ onClose }: ShoppingCartProps) {
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingItem, setUpdatingItem] = useState<string | null>(null)
  const [removingItem, setRemovingItem] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // animasi open sidebar
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsOpen(true))
    })
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 400)
  }

  // ambil data cart dari API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/cart")
        if (!res.ok) throw new Error("Failed to fetch cart")
        const data = await res.json()
        setCart(data.cartItems || [])
      } catch (error) {
        console.error("Error fetching cart:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [])

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return

    setUpdatingItem(productId)
    try {
      const res = await fetch(`/api/cart/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      })

      if (!res.ok) throw new Error("Failed to update quantity")

      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      )
    } catch (error) {
      console.error("Error updating quantity:", error)
    } finally {
      setUpdatingItem(null)
    }
  }

  const handleRemove = async (productId: string) => {
    setRemovingItem(productId)
    try {
      const res = await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) throw new Error("Failed to remove item")

      setCart((prev) => prev.filter((item) => item.productId !== productId))
    } catch (error) {
      console.error("Error removing item:", error)
    } finally {
      setRemovingItem(null)
    }
  }

  const total = cart.reduce(
    (sum, item) => sum + (item.product?.price ?? item.price) * item.quantity,
    0
  )

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setIsProcessing(true)

    try {
      // pastikan user sudah login
      const sessionRes = await fetch("/api/auth/session")
      const session = await sessionRes.json()
      if (!session?.user) {
        alert("Kamu harus login dulu sebelum checkout")
        setIsProcessing(false)
        return
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            id: item.productId,
            name: item.product?.name,
            price: item.product?.price,
            quantity: item.quantity,
          })),
          total,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Checkout failed")

      // ✅ load script Snap
      if (!window.snap) {
        const script = document.createElement("script")
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js"
        script.setAttribute(
          "data-client-key",
          process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""
        )
        document.body.appendChild(script)
        await new Promise((resolve) => (script.onload = resolve))
      }

      console.log(data.reuse ? "🟡 Reusing existing order" : "🆕 New order created")

      window.snap.pay(data.token, {
        onSuccess: async (result: any) => {
          console.log("Payment success:", result)
          alert("Pembayaran berhasil 🎉")
          try {
            await fetch("/api/cart/clear", { method: "DELETE" })
            console.log(data)
            await fetch("/api/checkout/notification", {
              method: "POST",
              body: JSON.stringify({ orderId: data.order.id, transaction_status: "paid", payment_method: result.payment_type }),
            })
            setCart([])
          } catch (err) {
            console.error("Gagal menghapus cart:", err)
          }

          handleClose()
        },
        onPending: (result: any) => {
          console.log("Payment pending:", result)
          alert("Pembayaran tertunda ⏳")
        },
        onError: (result: any) => {
          console.error("Payment error:", result)
          alert("Terjadi kesalahan pembayaran ❌")
        },
        onClose: () => {
          console.log("Popup closed without finishing payment")
        },
      })
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Gagal melakukan checkout")
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <>
        <div className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-linear-to-br from-slate-900 to-slate-950 shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p className="text-sm text-slate-400">Loading your cart...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-linear-to-br from-slate-900 to-slate-950 shadow-2xl flex flex-col border-l border-slate-700 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isClosing ? 'translate-x-full' : isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700 bg-slate-800/50">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-white">Shopping Cart</h2>
            {cart.length > 0 && (
              <p className="text-xs text-slate-400">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-6 rounded-full bg-slate-800 p-8 border border-slate-700">
                <ShoppingBag className="h-12 w-12 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Your cart is empty</h3>
              <p className="text-sm text-slate-400 mb-6">Add some games to get started</p>
              <Button
                onClick={handleClose}
                className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold"
              >
                Browse Games
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const isUpdating = updatingItem === item.productId
                const isRemoving = removingItem === item.productId
                const itemTotal = (item.product?.price ?? item.price) * item.quantity

                return (
                  <div
                    key={item.id}
                    className={`bg-slate-800/30 rounded-xl p-4 border border-slate-700 transition-all duration-200 ${isRemoving ? 'opacity-40 scale-95' : 'opacity-100 hover:border-blue-500/30'}`}
                  >
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-950 border border-slate-700">
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                        {/* Digital Badge */}
                        <div className="absolute bottom-1 left-1 bg-blue-500/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-0.5">
                          <Key size={10} />
                          KEY
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-sm text-white line-clamp-2 flex-1">
                            {item.product?.name || item.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 -mt-1 -mr-2 shrink-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleRemove(item.productId)}
                            disabled={isRemoving}
                          >
                            {isRemoving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center gap-1 mb-3">
                          <Download size={12} className="text-green-400" />
                          <p className="text-xs text-green-400 font-semibold">Instant Delivery</p>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                          {/* Quantity */}
                          <div className="inline-flex items-center rounded-lg bg-slate-900 border border-slate-700">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-r-none hover:bg-slate-800 text-white"
                              onClick={() =>
                                handleUpdateQuantity(item.productId, item.quantity - 1)
                              }
                              disabled={isUpdating || item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            <div className="w-10 text-center border-x border-slate-700">
                              {isUpdating ? (
                                <Loader2 className="h-3 w-3 animate-spin mx-auto text-slate-400" />
                              ) : (
                                <span className="text-sm font-bold text-white">{item.quantity}</span>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-l-none hover:bg-slate-800 text-white"
                              onClick={() =>
                                handleUpdateQuantity(item.productId, item.quantity + 1)
                              }
                              disabled={isUpdating}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Item Total */}
                          <p className="text-base font-black text-white">
                            {formatPrice(itemTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-6 py-5 space-y-4 bg-slate-800/50 border-t border-slate-700">
            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2 pb-4 border-b border-slate-700">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center border border-green-500/30">
                  <Download size={14} className="text-green-400" />
                </div>
                <span className="text-slate-300 font-medium">Instant<br/>Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/30">
                  <Shield size={14} className="text-blue-400" />
                </div>
                <span className="text-slate-300 font-medium">100%<br/>Secure</span>
              </div>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-slate-400">Subtotal</span>
                <p className="text-xs text-slate-500">Taxes included</p>
              </div>
              <span className="text-2xl font-black bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {formatPrice(total)}
              </span>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                className="w-full h-12 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Key className="h-5 w-5 mr-2" />
                    Checkout Now
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white font-bold"
                onClick={handleClose}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}