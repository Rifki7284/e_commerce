import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const { productId, quantity } = await req.json()

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 })
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { userId, productId },
    })

    let cartItem

    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) },
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity: quantity || 1,
        },
      })
    }

    return NextResponse.json(
      { message: "Added to cart successfully", cartItem },
      { status: 200 }
    )
  } catch (error) {
    console.error("❌ Error adding to cart:", error)
    return NextResponse.json(
      { message: "Something went wrong", error: (error as Error).message },
      { status: 500 }
    )
  }
}
export async function GET() {
  try {
    // ✅ Ambil session user
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(session.user.id)

    // ✅ Ambil semua item cart milik user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true, // kalau mau tampilkan foto produk
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ cartItems }, { status: 200 })
  } catch (error) {
    console.error("❌ Error getting cart items:", error)
    return NextResponse.json(
      { message: "Something went wrong", error: (error as Error).message },
      { status: 500 }
    )
  }
}