import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
export async function GET() {
  try {
    const session = await getServerSession()
    
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const formattedOrders = recentOrders.map(order => ({
      id: order.id,
      customerName: order.user.name || order.user.email,
      total: order.totalAmount,
      status: order.status,
      date: new Date(order.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error("Recent orders error:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent orders" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
