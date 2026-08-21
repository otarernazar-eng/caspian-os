import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { photoUrl } = await req.json();
    if (!photoUrl) {
      return NextResponse.json({ error: "No photo URL provided" }, { status: 400 });
    }

    // Fetch the image from the URL
    const imageRes = await fetch(photoUrl);
    if (!imageRes.ok) {
      return NextResponse.json({ error: "Failed to download image from URL" }, { status: 400 });
    }
    
    const imageBuffer = await imageRes.arrayBuffer();

    // Use Hugging Face free inference API for Image Captioning
    // We use BLIP (Bootstrapping Language-Image Pre-training) for robust captioning
    const hfRes = await fetch("https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        // Using a public anonymous tier (or if user sets HUGGINGFACE_API_KEY in .env)
        ...(process.env.HUGGINGFACE_API_KEY && { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` })
      },
      body: imageBuffer,
    });

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      console.error("HF API Error:", errText);
      // Fallback if HF rate limits us (since it's a free public tier)
      return NextResponse.json({ 
        description: "Груз на фото (ошибка API, попробуйте позже)", 
        requiresRefrigeration: false 
      });
    }

    const hfData = await hfRes.json();
    let caption = hfData[0]?.generated_text || "Неизвестный груз";

    // Basic heuristic to check if it needs refrigeration based on the English caption
    const coldKeywords = ["food", "meat", "fish", "vegetable", "fruit", "milk", "medical", "ice"];
    const needsCold = coldKeywords.some(kw => caption.toLowerCase().includes(kw));

    // Translate to Russian since the UI is in Russian (basic mapping or just keep English)
    // We will append a tag so the user sees it's AI generated
    const formattedCaption = `${caption} (AI Vision Detected)`;

    return NextResponse.json({ 
      description: formattedCaption,
      requiresRefrigeration: needsCold
    });

  } catch (error: any) {
    console.error("Vision Parse Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
