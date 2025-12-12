import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session || session.user?.role === "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json(
      { message: "Cart cleared successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { message: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
