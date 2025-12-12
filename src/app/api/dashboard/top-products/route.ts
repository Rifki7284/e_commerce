import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const session = await auth();
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Ambil order lengkap bulan ini
    const completedOrderIds = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        status: "paid",
      },
      select: { id: true },
    });

    if (completedOrderIds.length === 0) {
      return NextResponse.json([]); // Tidak ada pembelian bulan ini
    }

    // Group product berdasarkan jumlah order
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        orderId: {
          in: completedOrderIds.map((o) => o.id),
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const productDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            images: { take: 1, select: { url: true } },
          },
        });

        return {
          id: item.productId,
          name: product?.name || "Unknown Product",
          sales: item._sum.quantity || 0,
          revenue: (item._sum.quantity || 0) * (product?.price || 0),
          image: product?.images[0]?.url ?? "",
        };
      })
    );

    return NextResponse.json(productDetails);
  } catch (error) {
    console.error("Top products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch top products" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
