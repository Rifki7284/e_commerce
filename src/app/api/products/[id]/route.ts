import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const product = await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json(product);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}


export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();

    // Ambil field utama
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const stock = parseInt(formData.get("stock") as string, 10);
    const categoryRaw = formData.get("category") as string;

    // Validasi
    if (!name || !price || !stock || !categoryRaw) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    const categoryId = parseInt(categoryRaw, 10);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Parse image data
    const existingImages = JSON.parse(formData.get("existingImages") as string || "[]") as string[];
    const deletedImages = JSON.parse(formData.get("deletedImages") as string || "[]") as string[];
    const newImages = formData.getAll("newImages[]") as File[];

    const productId = parseInt(id, 10);

    // 🔹 1️⃣ Hapus data gambar di DB terlebih dahulu
    if (deletedImages.length > 0) {
      await prisma.productImage.deleteMany({
        where: { url: { in: deletedImages }, productId },
      });
    }

    // 🔹 2️⃣ Setelah itu baru hapus file-nya dari folder
    for (const url of deletedImages) {
      try {
        const filePath = path.join(process.cwd(), "public", url.replace(/^\/+/, ""));
        const uploadsPath = path.join(process.cwd(), "public", "uploads");

        if (filePath.startsWith(uploadsPath)) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted file: ${filePath}`);
          } else {
            console.warn(`⚠️ File not found: ${filePath}`);
          }
        } else {
          console.warn(`⛔ Skipped unsafe path: ${filePath}`);
        }
      } catch (err) {
        console.warn("⚠️ Failed to delete file:", err);
      }
    }

    // 🔹 3️⃣ Upload file baru
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const newImageUrls: string[] = [];

    for (const file of newImages) {
      if (!(file instanceof File)) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      newImageUrls.push(`/uploads/${fileName}`);
      console.log(`✅ Uploaded new image: ${fileName}`);
    }

    // 🔹 4️⃣ Update produk di database
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price,
        description,
        stock,
        categoryId,
        images: {
          create: newImageUrls.map((url) => ({ url })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("❌ Error updating product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}