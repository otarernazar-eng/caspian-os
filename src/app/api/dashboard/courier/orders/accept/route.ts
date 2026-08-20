import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "COURIER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, courierLat, courierLng } = await req.json();

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== "PENDING") {
      return NextResponse.json({ error: "Order not available" }, { status: 400 });
    }

    // Call 2GIS Routing API
    // 2GIS API typically requires start (courierLat, courierLng) and end (destLat, destLng)
    // We will use standard 2GIS directions API
    const apiKey = process.env.TWOGIS_API_KEY || "demo_key"; 
    let routeGeometry = null;
    let distance = null;
    let estimatedTime = null;

    if (courierLat && courierLng && order.destLat && order.destLng && apiKey !== "demo_key") {
      try {
        const response = await fetch(`https://routing.api.2gis.com/car/routing/2.0.0/global?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            points: [
              { x: courierLng, y: courierLat },
              { x: order.destLng, y: order.destLat }
            ],
            type: "jam", // Use current traffic
          })
        });
        
        if (response.ok) {
           const routeData = await response.json();
           if (routeData.result && routeData.result.length > 0) {
             const bestRoute = routeData.result[0];
             distance = bestRoute.total_distance;
             estimatedTime = bestRoute.total_duration;
             // Just store the WKT or whatever geometry they return
             // Usually it's in geometry.selection or similar
             routeGeometry = JSON.stringify(bestRoute); 
           }
        }
      } catch (err) {
        console.error("2GIS Routing Error:", err);
      }
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "ACCEPTED",
        courierId: session.id,
        routeGeometry,
        distance,
        estimatedTime
      }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
