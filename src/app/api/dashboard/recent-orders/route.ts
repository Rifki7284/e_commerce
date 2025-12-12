import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const formattedOrders = recentOrders.map((order) => ({
      id: order.id,
      customerName: order.user.name || order.user.email,
      total: order.totalAmount,
      status: order.status,
      date: new Date(order.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Recent orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent orders" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
