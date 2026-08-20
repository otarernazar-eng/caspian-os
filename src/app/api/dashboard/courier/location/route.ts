import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "COURIER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { lat, lng } = await req.json();

    if (lat === undefined || lng === undefined) {
       return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
    }

    const courierProfile = await prisma.courierProfile.findUnique({
      where: { userId: session.id }
    });

    if (!courierProfile) {
      return NextResponse.json({ error: "Courier profile not found" }, { status: 404 });
    }

    await prisma.courierProfile.update({
      where: { id: courierProfile.id },
      data: {
        lastLat: lat,
        lastLng: lng,
        lastUpdate: new Date(),
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
