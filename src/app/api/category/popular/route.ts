import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        product: {
          include: {
            orderItems: true,
          },
        },
      },
    });
    const popularCategories = categories
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        iconName: cat.iconName,
        totalSales: cat.product.reduce(
          (sum, p) => sum + p.orderItems.length,
          0
        ),
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 3);
    return Response.json(
      { success: true, data: popularCategories },
      { status: 200 }
    );
  } catch (e) {
    return Response.json(
      { success: false, message: "Failed to fetch popular category" },
      { status: 500 }
    );
  }
}
