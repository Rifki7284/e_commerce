import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role === "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { orderId, transaction_status, payment_method } = body;

    console.log("📩 Webhook received:", body);

    if (!orderId || !transaction_status) {
      return NextResponse.json(
        { message: "Missing orderId or transaction_status" },
        { status: 400 }
      );
    }

    // Default status
    let status: "paid" | "pending" | "failed" = "pending";

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
      return NextResponse.json({ message: "Invalid orderId" }, { status: 400 });
    }

    console.log(`🔄 Updating order ${orderIdNum} to status: ${status}`);

    const updatedOrder = await prisma.order.update({
      where: { id: orderIdNum },
      data: {
        status,
        paymentMethod: payment_method || null,
      },
      include: {
        orderItems: true,
      },
    });
    if (status === "paid") {
      console.log("📦 Payment successful → reducing stock...");

      for (const item of updatedOrder.orderItems) {
        const qty = item.quantity;
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
        const availableKeys = await prisma.gameKey.findMany({
          where: {
            productId: item.productId,
            status: "Available",
          },
          take: qty,
        });
        if (availableKeys.length < qty) {
          console.error(
            "❌ Not enough game keys available for product",
            item.productId
          );
          continue;
        }
        for (let i = 0; i < qty; i++) {
          const key = availableKeys[i];

          await prisma.gameKey.update({
            where: { id: key.id },
            data: {
              status: "Sold",
              soldAt: new Date(),
              orderItem: {
                connect: { id: item.id },
              },
            },
          });

          console.log(`🔑 Assigned key ${key.code} to orderItem ${item.id}`);
        }
        console.log(
          `🟡 Reduced stock for product ${item.productId} by ${item.quantity}`
        );
      }

      console.log("✅ All product stock updated!");
    }

    return NextResponse.json({
      message: "OK",
      updatedStatus: status,
      paymentMethod: payment_method || null,
    });
  } catch (error: any) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
