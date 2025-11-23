import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await prisma.order.findFirst({
            where: {
                transactionId: id
            },
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                images: true
                            }
                        }
                    }
                }
            }
        })
        return NextResponse.json({ data: data }, { status: 200 })
    }
    catch (e) {
        return NextResponse.json({ message: e }, { status: 500 })
    }

}