import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "COURIER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.courierId !== session.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 400 });
    }

    // Complete order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "DELIVERED" }
    });

    // Create a transaction to prove payment
    await prisma.transaction.create({
      data: {
        orderId: order.id,
        amount: order.price,
        status: "COMPLETED"
      }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
