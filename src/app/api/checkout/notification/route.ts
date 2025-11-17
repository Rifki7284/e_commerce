import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, transaction_status } = body;

    console.log("📩 Webhook received:", body);

    if (!orderId || !transaction_status) {
      return NextResponse.json(
        { message: "Missing orderId or transaction_status" },
        { status: 400 }
      );
    }

    // Default status
    let status: "paid" | "pending" | "failed" = "pending";

    // Tentukan status berdasarkan status dari Midtrans / Gateway
    switch (transaction_status) {
      case "capture":
      case "settlement":
      case "paid": 
        status = "paid";
        break;
      case "cancel":
      case "deny":
      case "expire":
        status = "failed";
        break;
      case "pending":
      default:
        status = "pending";
        break;
    }

    const orderIdNum = Number(orderId);
    if (isNaN(orderIdNum)) {
      return NextResponse.json(
        { message: "Invalid orderId" },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating order ${orderIdNum} to status: ${status}`);

    const updatedOrder = await prisma.order.update({
      where: { id: orderIdNum },
      data: { status },
    });

    console.log("✅ Order updated:", updatedOrder);

    return NextResponse.json({ message: "OK", updatedStatus: status });
  } catch (error: any) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
