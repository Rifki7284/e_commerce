import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    };
    const { id } = await params;
    const data = await prisma.order.findFirst({
      where: {
        transactionId: id,
        userId: Number(session.user.id),
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            keys: {
              include: {
                gameKey: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ data: data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}
