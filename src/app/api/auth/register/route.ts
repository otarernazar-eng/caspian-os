import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { phone, password, role, name, iin, vehiclePlate, vehicleBrand } = data;

    if (!phone || !password || !role || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this phone" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        role,
        name,
        iin,
      },
    });

    if (role === "COURIER") {
      if (!vehiclePlate || !vehicleBrand) {
         return NextResponse.json({ error: "Missing vehicle details for courier" }, { status: 400 });
      }
      await prisma.courierProfile.create({
        data: {
          userId: user.id,
          vehiclePlate,
          vehicleBrand
        }
      });
    }

    // Set session immediately on register
    await setSession(user);

    return NextResponse.json({ success: true, user: { id: user.id, role: user.role } });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
