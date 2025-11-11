import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";
import { success } from "zod";
const prisma = new PrismaClient();
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const count = await prisma.category.count();
    const page = Number(searchParams.get("page"));
    const perPage = Number(searchParams.get("perPage"));
    const search = searchParams.get("search")
    if (page == 1) {
        const category = await prisma.category.findMany({
            take: perPage,
            where: {
                OR: [
                    { name: { contains: search || "", mode: "insensitive" }, },
                ]
            },
        });
        return NextResponse.json({
            category: category,
            count: count,
            page: page,
        });
    } else {
        const skip = (page - 1) * perPage;
        const category = await prisma.category.findMany({
            skip: skip,
            take: perPage,
            where: {
                OR: [
                    {
                        name: { contains: search || "", mode: "insensitive" },
                    }
                ]
            },
        });
        return NextResponse.json({
            category: category,
            count: count,
            page: page,
        });
    }


}

// POST create new product
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const name = formData.get("name") as string
        const iconName = formData.get("iconName") as string
        const slug = formData.get("slug") as string
        const category = await prisma.category.create({
            data: {
                name,
                iconName,
                slug,
            },
        });
        return NextResponse.json({
            success: true,
            category: category
        });
    }
    catch (error) {
        console.error(error);
        return Response.json({ success: false, message: "Failed to create category" }, { status: 500 });
    }
}
