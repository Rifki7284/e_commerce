import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || 10;
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort");

    const skip = page === 1 ? 0 : (page - 1) * perPage;

    /* SORT */
    let orderBy: any = { createdAt: "desc" };

    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "price-high":
        orderBy = { totalPrice: "desc" };
        break;
      case "price-low":
        orderBy = { totalPrice: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    /* WHERE */
    const where: any = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              {
                user: {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                user: {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [orders, count] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: perPage,
        where,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: true,
              keys: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json(
      {
        orders: orders,
        count: count,
        page: page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
