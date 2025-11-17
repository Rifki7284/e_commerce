"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Plus, Minus, Trash2, ShoppingBag, Loader2 } from "lucide-react"
import formatPrice from "@/lib/formatPrice"
import { da } from "zod/v4/locales"

interface ShoppingCartProps {
  onClose: () => void
}
declare global {
  interface Window {
    snap: any;
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

  // ========================= 💳 MIDTRANS CHECKOUT =========================
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      // pastikan user sudah login
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      if (!session?.user) {
        alert("Kamu harus login dulu sebelum checkout");
        setIsProcessing(false);
        return;
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
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Checkout failed");

      // ✅ load script Snap
      if (!window.snap) {
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute(
          "data-client-key",
          process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""
        );
        document.body.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }

      console.log(data.reuse ? "🟡 Reusing existing order" : "🆕 New order created");

      window.snap.pay(data.token, {
        onSuccess: async (result: any) => {
          console.log("Payment success:", result);
          alert("Pembayaran berhasil 🎉");
          try {
            await fetch("/api/cart/clear", { method: "DELETE" });
            await fetch("/api/checkout/notification", {
              method: "POST",
              body: JSON.stringify({ orderId: data.order.id, transaction_status: "paid" }),
            });
            setCart([]);
          } catch (err) {
            console.error("Gagal menghapus cart:", err);
          }

          handleClose();
        },
        onPending: (result: any) => {
          console.log("Payment pending:", result);
          alert("Pembayaran tertunda ⏳");
        },
        onError: (result: any) => {
          console.error("Payment error:", result);
          alert("Terjadi kesalahan pembayaran ❌");
        },
        onClose: () => {
          console.log("Popup closed without finishing payment");
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Gagal melakukan checkout");
    } finally {
      setIsProcessing(false);
    }
  };



  if (loading) {
    return (
      <>
        <div className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'
          }`} />
        <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading your cart...</p>
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
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isClosing ? 'opacity-0' : isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isClosing ? 'translate-x-full' : isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b">
          <ShoppingBag className="h-5 w-5" />
          <h2 className="text-lg font-semibold flex-1">Shopping Cart</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-6 rounded-full bg-muted p-8">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">Add some items to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => {
                const isUpdating = updatingItem === item.productId
                const isRemoving = removingItem === item.productId
                const itemTotal = (item.product?.price ?? item.price) * item.quantity

                return (
                  <div
                    key={item.id}
                    className={`flex gap-4 transition-opacity duration-200 ${isRemoving ? 'opacity-40' : 'opacity-100'
                      }`}
                  >
                    {/* Image */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm line-clamp-2 flex-1">
                          {item.product?.name || item.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 -mt-1 -mr-2 shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemove(item.productId)}
                          disabled={isRemoving}
                        >
                          {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {formatPrice(item.product?.price ?? item.price)}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        {/* Quantity */}
                        <div className="inline-flex items-center rounded-md border bg-background">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-r-none hover:bg-muted"
                            onClick={() =>
                              handleUpdateQuantity(item.productId, item.quantity - 1)
                            }
                            disabled={isUpdating || item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <div className="w-12 text-center border-x">
                            {isUpdating ? (
                              <Loader2 className="h-3 w-3 animate-spin mx-auto text-muted-foreground" />
                            ) : (
                              <span className="text-sm font-medium">{item.quantity}</span>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-l-none hover:bg-muted"
                            onClick={() =>
                              handleUpdateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={isUpdating}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Item Total */}
                        <p className="text-sm font-semibold">
                          {formatPrice(itemTotal)}
                        </p>
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
          <div className="border-t px-6 py-5 space-y-4 bg-muted/20">
            <div className="flex items-center justify-between text-base">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold">{formatPrice(total)}</span>
            </div>

            <p className="text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout
            </p>

            <div className="space-y-3 pt-2">
              <Button className="w-full h-11 text-base" onClick={handleCheckout}>
                Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full h-11"
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