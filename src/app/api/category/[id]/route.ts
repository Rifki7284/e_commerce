import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const category = await prisma.category.delete({
      where: {
        id: Number(id),
      },
    });
    return NextResponse.json(category);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);
    const formData = await req.formData();
    const name = formData.get("name") as string
    const iconName = formData.get("iconName") as string
    const slug = formData.get("slug") as string
    const category = await prisma.category.update({
      where: { id: catId },
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
