import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Decode base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // We use the same reliable BLIP model for general image recognition
    const hfRes = await fetch("https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        ...(process.env.HUGGINGFACE_API_KEY && { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` })
      },
      body: buffer,
    });

    if (!hfRes.ok) {
      console.error("HF API failed", await hfRes.text());
      // Fallback for demo if rate limited
      return NextResponse.json({ 
        detected: true, 
        type: "Грузовик (Тент) [Mock]", 
        capacity: "5 тонн", 
        raw: "truck (fallback)" 
      });
    }

    const hfData = await hfRes.json();
    const caption = hfData[0]?.generated_text?.toLowerCase() || "";
    
    let type = "Неопознанный транспорт";
    let capacity = "-";
    let detected = true;

    // Analyze the caption for vehicle types
    if (caption.includes("truck") || caption.includes("lorry") || caption.includes("semi")) {
      type = "Магистральный Тягач (Фура)";
      capacity = "20 тонн";
    } else if (caption.includes("van")) {
      type = "Грузовой фургон (Газель)";
      capacity = "2.5 тонны";
    } else if (caption.includes("pickup")) {
      type = "Пикап";
      capacity = "1 тонна";
    } else if (caption.includes("car") || caption.includes("suv") || caption.includes("jeep")) {
      type = "Легковой автомобиль";
      capacity = "До 500 кг";
    } else if (caption.includes("bus")) {
      type = "Пассажирский автобус";
      capacity = "Только пассажиры";
    } else {
      detected = false;
      type = "Транспорт не найден в кадре";
    }

    return NextResponse.json({ 
      detected, 
      type, 
      capacity, 
      raw: caption 
    });

  } catch (error: any) {
    console.error("Vehicle Parse Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
