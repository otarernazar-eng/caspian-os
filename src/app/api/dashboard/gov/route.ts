import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "GOVERNMENT" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        cargo: true,
        vehicle: true,
      },
    });

    const bottlenecks = await prisma.bottleneck.findMany();

    const stats = {
      activeShipments: shipments.filter(s => s.status === "IN_TRANSIT").length,
      totalCargoWeight: shipments.reduce((acc, s) => acc + (s.cargo[0]?.weight || 0), 0),
      averageDelay: bottlenecks.reduce((acc, b) => acc + b.averageDelay, 0) / (bottlenecks.length || 1),
      criticalIncidents: bottlenecks.filter(b => b.severity === "RED").length,
      economicLoss: bottlenecks.reduce((acc, b) => acc + b.economicImpact, 0)
    };

    return NextResponse.json({ shipments, bottlenecks, stats });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
