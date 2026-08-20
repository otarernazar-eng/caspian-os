import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { customerId: session.id },
      orderBy: { createdAt: 'desc' },
      include: {
        courier: {
          include: { courierProfile: true }
        }
      }
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { destLat, destLng, destAddress, description, price, requiresRefrigeration, isRemoteVillage, photoUrl } = await req.json();

    const order = await prisma.order.create({
      data: {
        customerId: session.id,
        status: "PENDING",
        destLat,
        destLng,
        destAddress,
        description,
        price: parseFloat(price),
        requiresRefrigeration: !!requiresRefrigeration,
        isRemoteVillage: !!isRemoteVillage,
        photoUrl: photoUrl || "https://images.unsplash.com/photo-1586528116311-ad8ed7c50a63?auto=format&fit=crop&w=300&q=80"
      }
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
