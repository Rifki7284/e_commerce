import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.gameKey.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { message: "Error deleting key", error: e },
      { status: 500 }
    );
  }
}
