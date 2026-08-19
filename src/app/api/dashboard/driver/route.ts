import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "DRIVER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId: session.id },
      include: {
        shipments: {
          include: { cargo: true, vehicle: true },
          where: { status: "IN_TRANSIT" },
          take: 1
        }
      }
    });

    return NextResponse.json({ shipments: driverProfile?.shipments || [] });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
