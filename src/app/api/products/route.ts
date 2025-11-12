import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";
const prisma = new PrismaClient();

// GET all products
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const count = await prisma.product.count();
  const page = Number(searchParams.get("page"));
  const perPage = Number(searchParams.get("perPage"));
  const search = searchParams.get("search")
  if (page == 1) {
    const products = await prisma.product.findMany({
      take: perPage,
      where: {
        OR: [
          { name: { contains: search || "", mode: "insensitive" }, },
          { description: { contains: search || "", mode: "insensitive" } }
        ]
      },
      include: {
        images: true,
        categories: true,
      },
    });
    return NextResponse.json({
      product: products,
      count: count,
      page: page,
    });
  } else {
    const skip = (page - 1) * perPage;
    const products = await prisma.product.findMany({
      skip: skip,
      take: perPage,
      where: {
        OR: [
          {
            name: { contains: search || "", mode: "insensitive" },
            description: { contains: search || "", mode: "insensitive" }
          }
        ]
      },
      include: {
        images: true,
        categories: true,
      },
    });
    return NextResponse.json({
      product: products,
      skip: skip,
      count: count,
      page: page,
    });
  }


}

// POST create new product
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const stock = parseInt(formData.get("stock") as string, 10);
    const categoryIdRaw = formData.get("categoryId");

    if (!categoryIdRaw) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const categoryId = Number(categoryIdRaw);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid Category ID" },
        { status: 400 }
      );
    }

    // ✅ Ambil semua file (karena dikirim sebagai "files[]")
    const files = formData.getAll("files[]") as File[];

    const imageUrls: string[] = [];

    // Buat folder upload jika belum ada
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ✅ Simpan semua file satu per satu
    for (const file of files) {
      if (!(file instanceof File)) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      imageUrls.push(`/uploads/${fileName}`);
    }

    // ✅ Simpan ke database dengan relasi ke images
    const product = await prisma.product.create({
      data: {
        name,
        price,
        description,
        stock,
        categoryId,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}