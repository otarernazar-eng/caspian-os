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

    // 3. Smart Match Algorithm: Find return cargo and combined cargo (Real DB query)
    let smartMatchReturnOrder = null;
    let smartMatchCombineOrder = null;

    if (activeOrder) {
      const allPending = await prisma.order.findMany({
        where: { status: "PENDING" },
        include: { customer: true },
        take: 10
      });
      
      if (allPending.length > 0) {
        // Find order to the same destination (Combine Cargo)
        smartMatchCombineOrder = allPending.find(o => o.destAddress.toLowerCase().includes(activeOrder.destAddress.toLowerCase().split(',')[0]));
        
        // Find return cargo (Any other order)
        smartMatchReturnOrder = allPending.find(o => o.id !== smartMatchCombineOrder?.id);
      }
    }

    // 4. Real-time Weather Alert for Mangistau (Aktau)
    let weatherAlert = null;
    try {
      const weatherRes = await fetch("https://api.open-meteo.com/v1/forecast?latitude=43.6481&longitude=51.1983&current_weather=true");
      if (weatherRes.ok) {
        const weatherData = await weatherRes.json();
        const current = weatherData.current_weather;
        if (current.windspeed > 15) {
          weatherAlert = `DUST STORM WARNING: Wind speed ${current.windspeed} km/h`;
        } else if (current.temperature > 35) {
          weatherAlert = `EXTREME HEAT: ${current.temperature}°C`;
        } else {
          weatherAlert = `Normal: ${current.temperature}°C, Wind ${current.windspeed} km/h`;
        }
      }
    } catch (e) {
      console.error("Weather fetch failed", e);
    }

    return NextResponse.json({ 
      activeOrder, 
      pendingOrders: activeOrder ? [] : pendingOrders,
      smartMatchOrder: smartMatchReturnOrder,
      smartMatchCombineOrder,
      weatherAlert
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
