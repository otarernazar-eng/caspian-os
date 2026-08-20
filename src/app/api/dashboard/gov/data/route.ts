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

    // Calculate AI Economic metrics
    // Assume 40% reduction in empty mileage (from the hackathon case context)
    const totalDistanceMeters = orders.reduce((sum, o) => sum + (o.distance || 0), 0);
    const totalDistanceKm = totalDistanceMeters / 1000;
    
    // The platform reduces empty runs by finding return cargo. 
    // Say without platform, empty run is 100% of distance. With platform, we save 40% of that.
    const savedEmptyRunKm = totalDistanceKm * 0.4;
    const fuelSavedLiters = savedEmptyRunKm * 0.15; // 15 liters per 100km (trucks/vans)
    const co2SavedKg = fuelSavedLiters * 2.68; // 2.68 kg CO2 per liter of diesel

    const ecoMetrics = {
      totalDistanceKm: totalDistanceKm.toFixed(1),
      savedEmptyRunKm: savedEmptyRunKm.toFixed(1),
      fuelSavedLiters: fuelSavedLiters.toFixed(1),
      co2SavedKg: co2SavedKg.toFixed(1),
      totalEconomicImpactKzt: (fuelSavedLiters * 295).toFixed(0) // 295 KZT per liter of diesel
    };

    return NextResponse.json({ couriers, customers, orders, ecoMetrics });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
