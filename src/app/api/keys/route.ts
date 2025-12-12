import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = await auth();
  if (!session || session.user?.role !== "Admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const productId = searchParams.get("productId");
  const cursor = searchParams.get("cursor");
  const status = searchParams.get("status"); // Available | Sold | all
  const search = searchParams.get("search") || "";
  const limit = 20;

  // 🔥 FILTER WHERE
  let where: any = {};

  if (productId) {
    where.productId = Number(productId);
  }

  if (status && status !== "all") {
    where.status = status;
  }

  if (search) {
    where.code = {
      contains: search,
      mode: "insensitive",
    };
  }

  // 🔥 QUERY PAGINATION
  let query: any = {
    take: limit,
    orderBy: { id: "asc" },
    where,
  };

  if (cursor) {
    query.cursor = { id: Number(cursor) };
    query.skip = 1;
  }

  const keys = await prisma.gameKey.findMany(query);

  const nextCursor = keys.length === limit ? keys[keys.length - 1].id : null;

  // 🔥 COUNT BASED ON PRODUCT ID
  const available = await prisma.gameKey.count({
    where: { productId: Number(productId), status: "Available" },
  });

  const sold = await prisma.gameKey.count({
    where: { productId: Number(productId), status: "Sold" },
  });
  const all = await prisma.gameKey.count();

  return NextResponse.json({
    keys,
    available,
    sold,
    all,
    nextCursor,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const code = formData.get("keys") as string;
    const productId = Number(formData.get("productId"));
    await prisma.$transaction(async (tx) => {
      await tx.gameKey.create({
        data: {
          code,
          productId,
        },
      });
      await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            increment: 1,
          },
        },
      });
    });
  
    return NextResponse.json(
      { message: "Key berhasil ditambahkan dan stok diperbarui" },
      { status: 200 }
    );
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { message: e?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
