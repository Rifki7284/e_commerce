import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();
  const { name, price, description, images } = body;

  try {
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        price,
        description,
        images: {
          deleteMany: {},
          create: images.map((url: string) => ({ url })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
