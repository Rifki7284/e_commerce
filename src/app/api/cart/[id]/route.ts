import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quantity } = await req.json();
    if (!productId || typeof quantity !== "number") {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    try {
        const updatedItem = await prisma.cartItem.updateMany({
            where: {
                userId: parseInt(session.user.id),
                productId: productId,
            },
            data: {
                quantity,
            },
        });

        if (updatedItem.count === 0) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Quantity updated successfully" });
    } catch (error) {
        console.error("Error updating cart:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!productId) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    try {
        const deletedItem = await prisma.cartItem.deleteMany({
            where: {
                userId: parseInt(session.user.id),
                productId: productId,
            },
        });

        if (deletedItem.count === 0) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Item removed successfully" });
    } catch (error) {
        console.error("Error removing cart item:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}