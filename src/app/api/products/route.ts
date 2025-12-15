import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const count = await prisma.product.count();
    const page = Number(searchParams.get("page"));
    const perPage = Number(searchParams.get("perPage"));
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");

    const minPrice = minPriceParam ? Number(minPriceParam) : null;
    const maxPrice = maxPriceParam ? Number(maxPriceParam) : null;
    let priceFilter: any = {};

    if (minPrice !== null) {
      priceFilter.gte = minPrice;
    }

    if (maxPrice !== null) {
      priceFilter.lte = maxPrice;
    }
    const sort = searchParams.get("sort");

    let orderBy: any = undefined;

    switch (sort) {
      case "price-low":
        orderBy = { price: "asc" };
        break;

      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = null;
        break;
      default:
        orderBy = { id: "asc" };
    }
    if (sort === "rating") {
      const skip = page == 1 ? 0 : (page - 1) * perPage;

      const ratingData = await prisma.review.groupBy({
        by: ["productId"],
        _avg: { star: true },
        orderBy: { _avg: { star: "desc" } },
        skip: skip,
        take: perPage,
      });

      const sortedIds = ratingData.map((r: { productId: any }) => r.productId);

      const products = await prisma.product.findMany({
        where: {
          id: { in: sortedIds },
          ...(category ? { categoryId: Number(category) } : {}),
          ...(minPrice !== null || maxPrice !== null
            ? { price: priceFilter }
            : {}),
          OR: [
            { name: { contains: search || "", mode: "insensitive" } },
            { description: { contains: search || "", mode: "insensitive" } },
          ],
        },
        include: {
          images: true,
          categories: true,
          reviews: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      const finalSorted = sortedIds
        .map((id: any) => products.find((p: { id: any }) => p.id === id))
        .filter(Boolean);

      return NextResponse.json(
        {
          product: finalSorted,
          count: count,
          page: page,
        },
        { status: 200 }
      );
    }
    if (page == 1) {
      const products = await prisma.product.findMany({
        take: perPage,
        where: {
          ...(category ? { categoryId: Number(category) } : {}),
          ...(minPrice !== null || maxPrice !== null
            ? { price: priceFilter }
            : {}),
          OR: [
            { name: { contains: search || "", mode: "insensitive" } },
            { description: { contains: search || "", mode: "insensitive" } },
          ],
        },
        orderBy,
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
      return NextResponse.json(
        {
          product: products,
          count: count,
          page: page,
        },
        { status: 200 }
      );
    } else {
      const skip = (page - 1) * perPage;
      const products = await prisma.product.findMany({
        skip: skip,
        take: perPage,
        where: {
          ...(category ? { categoryId: Number(category) } : {}),
          ...(minPrice !== null || maxPrice !== null
            ? { price: priceFilter }
            : {}),
          OR: [
            { name: { contains: search || "", mode: "insensitive" } },
            { description: { contains: search || "", mode: "insensitive" } },
          ],
        },
        orderBy,
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
      return NextResponse.json(
        {
          product: products,
          skip: skip,
          count: count,
          page: page,
        },
        { status: 200 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      {
        message: e,
      },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const slug = formData.get("slug") as string;
    const categoryIdRaw = formData.get("categoryId");

    if (!categoryIdRaw) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }
    const existing = await prisma.product.findFirst({ where: { slug: slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
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
        stock:0,
        slug,
        categoryId,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: { images: true },
    });
    return NextResponse.json(
      { res: "Data berhasil ditambahkan" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: error},
      { status: 500 }
    );
  }
}
