import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function PrintLabel({ params, searchParams }: { params: { id: string }, searchParams: { origin?: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id }
  });

  if (!order) return notFound();

  // URL for the public tracking page (assumes deployment root, dynamically we might need a fixed domain, but for demo we can use relative or a mock)
  const origin = searchParams.origin || "https://caspian-os.vercel.app";
  const trackingUrl = `${origin}/track/${order.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackingUrl)}`;

  return (
    <div className="bg-white text-black min-h-screen p-4 flex justify-center font-sans">
      <div className="w-[80mm] border-2 border-black p-4 flex flex-col items-center text-center bg-white" style={{ fontFamily: 'monospace' }}>
        <h1 className="text-2xl font-bold uppercase mb-2">RAYCAST</h1>
        <div className="w-full h-px bg-black my-2"></div>
        
        <div className="text-lg font-bold mb-1">SHIPMENT #{order.id.slice(0, 8)}</div>
        <div className="text-sm font-bold uppercase">{order.description}</div>
        
        <div className="w-full h-px bg-black my-3"></div>
        
        <div className="text-left w-full space-y-2 text-sm">
          <div><strong>DESTINATION:</strong><br/>{order.destAddress}</div>
          <div><strong>STATUS:</strong> READY</div>
          {order.requiresRefrigeration && <div><strong>REQUIREMENT:</strong> IoT COOLING</div>}
          {order.isRemoteVillage && <div><strong>TYPE:</strong> SUBSIDIZED ROUTE</div>}
        </div>
        
        <div className="w-full h-px bg-black my-4"></div>

        <div className="mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCodeUrl} alt="QR Code" width={150} height={150} className="mx-auto" />
        </div>
        <div className="text-xs">SCAN TO TRACK</div>

        <div className="w-full h-px bg-black my-4"></div>
        
        <div className="text-xs">
          Date: {new Date(order.createdAt).toLocaleDateString()}
        </div>

        {/* Auto-print script for convenience */}
        <script dangerouslySetInnerHTML={{
          __html: `setTimeout(() => window.print(), 500);`
        }} />
      </div>
    </div>
  );
}
