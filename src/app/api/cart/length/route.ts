import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const data = await prisma.cartItem.count()
        return NextResponse.json({ data: data }, { status: 200 })
    }
    catch (e) {
        return NextResponse.json({ message: e }, { status: 500 })
    }
}