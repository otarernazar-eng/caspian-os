import { NextResponse } from "next/server";
import { parseOrder } from "@/lib/ai/parse-order";
import settlementsData from "@/data/settlements.json";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const context = {
      settlements: settlementsData as any,
      now: new Date()
    };

    const parsed = await parseOrder(text, context);
    
    // Convert origin_id and destination_id back to names for UI display
    let originName = "Неизвестно";
    let destName = "Неизвестно";
    
    if (parsed.origin_id) {
      const s = context.settlements.find((x: any) => x.id === parsed.origin_id);
      if (s) originName = s.name_ru || s.name_kz;
    }
    
    if (parsed.destination_id) {
      const s = context.settlements.find((x: any) => x.id === parsed.destination_id);
      if (s) destName = s.name_ru || s.name_kz;
    }

    return NextResponse.json({ 
      origin: originName,
      destination: destName,
      cargo: parsed.cargo || "Не указан",
      weight: parsed.weight_kg ? String(parsed.weight_kg) : "0",
      parsed_by: parsed.parsed_by,
      warnings: parsed.warnings
    });
  } catch (error: any) {
    console.error("Parse Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
