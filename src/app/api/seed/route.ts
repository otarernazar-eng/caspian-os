import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  return handleSeed();
}

export async function GET() {
  return handleSeed();
}

async function handleSeed() {
  try {
    // Get first customer and courier
    const customer = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    const courier = await prisma.user.findFirst({ where: { role: "COURIER" } });
    
    if (!customer || !courier) {
      return NextResponse.json({ error: "Please register at least one Customer and one Courier first." }, { status: 400 });
    }

    const mockOrders = [
      {
        customerId: customer.id,
        courierId: courier.id,
        status: "DELIVERED",
        destLat: 43.3421,
        destLng: 52.8622,
        destAddress: "Zhanaozen, Microdistrict 2",
        description: "Industrial Pipes (1200kg)",
        price: 45000,
        distance: 145000,
        estimatedTime: 5400,
        isRemoteVillage: false,
        requiresRefrigeration: false,
      },
      {
        customerId: customer.id,
        courierId: courier.id,
        status: "DELIVERED",
        destLat: 44.1352,
        destLng: 51.9163,
        destAddress: "Shetpe Village Center",
        description: "Medical Supplies",
        price: 32000,
        distance: 105000,
        estimatedTime: 4200,
        isRemoteVillage: true,
        requiresRefrigeration: true,
      },
      {
        customerId: customer.id,
        courierId: null,
        status: "PENDING",
        destLat: 45.3197,
        destLng: 55.2023,
        destAddress: "Beyneu Railway Station",
        description: "Construction Cement (5 Tons)",
        price: 120000,
        distance: 460000,
        estimatedTime: 18000,
        isRemoteVillage: false,
        requiresRefrigeration: false,
      },
      {
        customerId: customer.id,
        courierId: null,
        status: "PENDING",
        destLat: 44.5097,
        destLng: 50.2528,
        destAddress: "Fort-Shevchenko Port",
        description: "Frozen Fish (2 Tons)",
        price: 85000,
        distance: 130000,
        estimatedTime: 5000,
        isRemoteVillage: false,
        requiresRefrigeration: true,
      }
    ];

    await prisma.order.createMany({ data: mockOrders });

    return NextResponse.json({ success: true, message: "Mock data seeded successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
