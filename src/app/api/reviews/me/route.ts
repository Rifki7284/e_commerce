import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams=req.nextUrl.searchParams;
    const productId = Number(searchParams.get("productId"));
    const session = await auth();
    if (!session || session.user?.role === "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const data = await prisma.review.findFirst({
      where: {
        AND: [{ productId: productId }, { userId: userId }],
      },
    });
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}
