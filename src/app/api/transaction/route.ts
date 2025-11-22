import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const count = await prisma.order.count({
        where: {
            status: "paid"
        }
    });
    try {
        const searchParams = req.nextUrl.searchParams;
        const page = Number(searchParams.get("page"));
        const perPage = Number(searchParams.get("perPage"));
        const search = searchParams.get("search")
        const skip = page == 1 ? 0 : (page - 1) * perPage;
        if (perPage) {
            if (page == 1) {
                const transaction = await prisma.order.findMany({
                    take: perPage,

                    where: {
                        status: "paid",
                        OR: [
                            { transactionId: { contains: search || "", mode: "insensitive" } }
                        ]
                    }
                })

                return NextResponse.json({
                    transaction: transaction,
                    count: count,
                    page: page,
                }, { status: 200 });
            } else {
                const transaction = await prisma.order.findMany({
                    take: perPage,
                    skip: skip,
                    where: {
                        status: "paid",
                        OR: [
                            { transactionId: { contains: search || "", mode: "insensitive" } }
                        ]
                    }
                })
                return NextResponse.json({
                    transaction: transaction,
                    count: count,
                    page: page,
                }, { status: 200 });
            }
        }
        else {
            const transaction = await prisma.order.findMany({
                where: {
                    status: "paid",
                    OR: [
                        { transactionId: { contains: search || "", mode: "insensitive" } }
                    ]
                }
            })
            return NextResponse.json({
                transaction: transaction,
                count: count,
                page: page,
            }, { status: 200 });
        }
    }
    catch (e) {
        return NextResponse.json({ message: e }, { status: 500 })
    }
}