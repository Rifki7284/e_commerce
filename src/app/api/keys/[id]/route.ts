import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const keyId = Number(id);
    await prisma.$transaction(async (tx) => {
      const key = await tx.gameKey.findUnique({
        where: { id: keyId },
      });

      if (!key) {
        throw new Error("Key not found");
      }
      await tx.gameKey.delete({
        where: { id: keyId },
      });

      await tx.product.update({
        where: { id: key.productId },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });
    });

    return NextResponse.json({ message: "Key deleted & stock updated" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Error deleting key", error: e },
      { status: 500 }
    );
  }
}
