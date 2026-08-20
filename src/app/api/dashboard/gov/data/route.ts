import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "GOVERNMENT" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const couriers = await prisma.user.findMany({
      where: { role: "COURIER" },
      include: { courierProfile: true },
      orderBy: { createdAt: "desc" }
    });

    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" }
    });

    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        courier: { include: { courierProfile: true } },
        transactions: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ couriers, customers, orders });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
