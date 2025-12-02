import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { slug: { contains: slug || "", mode: "insensitive" }, },
            ]
        },
        include: {
            images: true,
            categories: true,
            reviews: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
    return NextResponse.json({
        product: products,
    }, { status: 200 });
}