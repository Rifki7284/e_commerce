import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month revenue & order count
    const currentMonthOrders = await prisma.order.aggregate({
      where: {
        status: {
          in: ["paid", "completed"],
        },
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
      _count: true,
    });

    // Last month revenue & order count
    const lastMonthOrders = await prisma.order.aggregate({
      where: {
        status: {
          in: ["paid", "completed"],
        },
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { totalAmount: true },
      _count: true,
    });

    // Total counts
    const totalOrders = await prisma.order.count();
    const currentProducts = await prisma.product.count();
    const currentCustomers = await prisma.user.count({
      where: { role: "Client" },
    });

    const lastMonthCustomers = await prisma.user.count({
      where: { role: "Client", createdAt: { lte: endOfLastMonth } },
    });

    // ------ FIX: Growth Calculation -------
    const calcGrowth = (current: number, previous: number) => {
      // Jika bulan lalu kosong dan bulan ini ada → return 100
      if (previous === 0 && current > 0) return 100;

      // Jika dua-duanya kosong → return 0
      if (previous === 0 && current === 0) return 0;

      // Normal formula
      return ((current - previous) / previous) * 100;
    };

    const revenueGrowth = calcGrowth(
      currentMonthOrders._sum.totalAmount || 0,
      lastMonthOrders._sum.totalAmount || 0
    );

    const ordersGrowth = calcGrowth(
      currentMonthOrders._count || 0,
      lastMonthOrders._count || 0
    );

    const productsGrowth = calcGrowth(currentProducts, currentProducts - 1); // Optional logic jika produk bertambah
    const customersGrowth = calcGrowth(currentCustomers, lastMonthCustomers);

    return NextResponse.json({
      totalRevenue: currentMonthOrders._sum.totalAmount || 0,
      totalOrders,
      totalProducts: currentProducts,
      totalCustomers: currentCustomers,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      ordersGrowth: Math.round(ordersGrowth * 10) / 10,
      productsGrowth: Math.round(productsGrowth * 10) / 10,
      customersGrowth: Math.round(customersGrowth * 10) / 10,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
