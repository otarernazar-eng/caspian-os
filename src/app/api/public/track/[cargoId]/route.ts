import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ cargoId: string }> }) {
  try {
    const { cargoId } = await params;
    // For demo purposes, if cargoId is 'demo', return the first seeded shipment
    let shipment;
    if (cargoId === 'demo') {
      shipment = await prisma.shipment.findFirst({
        include: { cargo: true, vehicle: true }
      });
    } else {
      shipment = await prisma.shipment.findUnique({
        where: { trackingId: cargoId },
        include: { cargo: true, vehicle: true }
      });
    }

    if (!shipment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ shipment });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
