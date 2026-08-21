import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Receive data from Python script
export async function POST(req: Request) {
  try {
    const { location, lat, lng, car_count, congestion_level } = await req.json();

    const trafficData = await prisma.trafficData.create({
      data: {
        location,
        lat,
        lng,
        carCount: car_count,
        congestionLevel: congestion_level
      }
    });

    return NextResponse.json({ success: true, trafficData });
  } catch (error) {
    console.error("Traffic API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get latest traffic data for the map
export async function GET() {
  try {
    // Get the most recent traffic update
    const latestTraffic = await prisma.trafficData.findFirst({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ traffic: latestTraffic });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
