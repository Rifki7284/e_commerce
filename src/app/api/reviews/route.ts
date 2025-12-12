import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role === "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const searchParams = req.nextUrl.searchParams;
    const productId = Number(searchParams.get("productId"));
    const data = await prisma.review.findMany({
      where: {
        productId: productId,
      },
    });
    return NextResponse.json({ success: true, data: data }, { status: 500 });
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role === "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { productId, star, review } = await req.json();
    const userId = Number(session.user.id);

    const dataReview = await prisma.review.create({
      data: {
        review: review,
        star: star,
        productId: productId,
        userId: userId,
      },
    });
    return NextResponse.json({ message: dataReview }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}
