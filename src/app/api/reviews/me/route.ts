import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const productId = Number(searchParams.get("productId"));
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const userId = Number(session.user.id);
        const data = await prisma.review.findFirst({
            where: {
                AND: [
                    { productId: productId },
                    { userId: userId }
                ]
            }
        })
        return NextResponse.json(data, { status: 200 })
    }
    catch (e) {
        return NextResponse.json({ message: e }, { status: 500 })
    }
}