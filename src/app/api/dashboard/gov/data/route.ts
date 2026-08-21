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

    const subsidizedOrders = orders.filter(o => o.isRemoteVillage);
    const subsidyBudgetUsed = subsidizedOrders.reduce((sum, o) => sum + (o.price * 0.2), 0);

    const socialMetrics = {
      subsidizedDeliveries: subsidizedOrders.length,
      subsidyBudgetUsedKzt: subsidyBudgetUsed.toFixed(0)
    };

    // Infrastructure Planning Analytics
    // Case requirement: "Акимат не видит реальной картины грузоперевозок для планирования дорог"
    // Solution: We analyze 2GIS distance vs estimated time to find "Low Speed Zones" (Bad Roads)
    const bottlenecks = orders
      .filter(o => o.distance && o.estimatedTime)
      .map(o => {
        const distKm = o.distance! / 1000;
        const timeHours = o.estimatedTime! / 3600;
        const avgSpeed = distKm / timeHours;
        return {
          address: o.destAddress,
          speed: avgSpeed,
          distKm
        };
      })
      .filter(b => b.speed < 40 && b.distKm > 5) // Speed < 40 km/h on routes longer than 5km indicates bad road quality
      .sort((a, b) => a.speed - b.speed);

    // Group bottlenecks by address to find recurring bad roads
    const roadIssues = bottlenecks.reduce((acc: any, b) => {
      if (!acc[b.address]) acc[b.address] = { address: b.address, reports: 0, avgSpeed: 0 };
      acc[b.address].reports += 1;
      acc[b.address].avgSpeed = (acc[b.address].avgSpeed + b.speed) / 2; // naive moving avg
      return acc;
    }, {});

    const topBadRoads = Object.values(roadIssues).sort((a: any, b: any) => b.reports - a.reports).slice(0, 5);

    const trafficData = await prisma.trafficData.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    });

    return NextResponse.json({ couriers, customers, orders, ecoMetrics, socialMetrics, badRoads: topBadRoads, trafficData });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
