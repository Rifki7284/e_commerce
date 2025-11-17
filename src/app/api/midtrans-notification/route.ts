import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { order_id, transaction_status, fraud_status } = body

    console.log("📩 Midtrans webhook received:", { order_id, transaction_status, fraud_status })

    // Tentukan status yang akan disimpan di DB
    let status = "pending"
    if (transaction_status === "capture" || transaction_status === "settlement") {
      status = "paid"
    } else if (transaction_status === "deny" || transaction_status === "cancel" || transaction_status === "expire") {
      status = "failed"
    }

    // 🔄 Update order di database
    await prisma.order.update({
      where: { id: Number(order_id) },
      data: { status },
    })

    console.log(`✅ Order ${order_id} updated to ${status}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
