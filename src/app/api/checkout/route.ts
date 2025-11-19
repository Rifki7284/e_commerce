import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Waktu kadaluarsa pending order dalam milidetik (5 jam)
const PENDING_EXPIRE = 5 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { items, total } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Cart kosong" }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!serverKey || !clientKey) throw new Error("MIDTRANS keys missing");

    // ✅ Tandai order pending lama sebagai expired
    await prisma.order.updateMany({
      where: {
        userId,
        status: "pending",
        createdAt: { lt: new Date(Date.now() - PENDING_EXPIRE) },
      },
      data: { status: "expired" },
    });

    // ✅ Buat order baru selalu
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: total,
        status: "pending",
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // ✅ Buat transaksi Midtrans baru
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey,
      clientKey,
    });

    const parameter = {
      transaction_details: {
        order_id: `ORDER-${order.id}`,
        gross_amount: total,
      },
      item_details: items.map((item: any) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      })),
      customer_details: {
        first_name: session.user.name || "User",
        email: session.user.email || "user@example.com",
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // ✅ Simpan token dan transactionId ke DB
    await prisma.order.update({
      where: { id: order.id },
      data: {
        snapToken: transaction.token,
        transactionId: `ORDER-${order.id}`,
      },
    });

    return NextResponse.json({
      token: transaction.token,
      reuse: false,
      order,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { message: error.message || "Checkout gagal" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    // ✅ Hanya ambil cart items untuk user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: { include: { images: true } } },
      orderBy: { createdAt: "desc" },
    });

    // ✅ Filter order pending <5 jam atau masih valid
    const validOrders = await prisma.order.findMany({
      where: {
        userId,
        status: "pending",
        createdAt: { gte: new Date(Date.now() - PENDING_EXPIRE) },
      },
      orderBy: { createdAt: "desc" },
      include: { orderItems: true },
    });

    return NextResponse.json({
      cartItems,
      validOrders,
    }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error getting cart items/orders:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: error.message },
      { status: 500 }
    );
  }
}
