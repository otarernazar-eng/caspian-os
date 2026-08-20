import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "COURIER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch the courier's active order if any
    const activeOrder = await prisma.order.findFirst({
      where: { 
        courierId: session.id,
        status: { in: ["ACCEPTED", "IN_TRANSIT"] }
      },
      include: { customer: true }
    });

    // 2. If no active order, fetch all PENDING orders
    const pendingOrders = await prisma.order.findMany({
      where: { status: "PENDING" },
      include: { customer: true },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ 
      activeOrder, 
      pendingOrders: activeOrder ? [] : pendingOrders 
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
