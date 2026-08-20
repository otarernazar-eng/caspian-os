import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PrintReceipt({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      courier: true
    }
  });

  if (!order || order.status !== "DELIVERED") return notFound();

  return (
    <div className="bg-white text-black min-h-screen p-4 flex justify-center font-sans">
      <div className="w-[80mm] border-2 border-black p-4 flex flex-col items-center text-center bg-white" style={{ fontFamily: 'monospace' }}>
        <h1 className="text-2xl font-bold uppercase mb-2">RAYCAST</h1>
        <div className="text-sm font-bold uppercase border-y border-black py-1 w-full">DELIVERY CONFIRMED</div>
        
        <div className="w-full text-left mt-4 space-y-2 text-sm">
          <div><strong>SHIPMENT:</strong> #{order.id.slice(0, 8)}</div>
          <div><strong>CARGO:</strong> {order.description}</div>
          <div><strong>DESTINATION:</strong><br/>{order.destAddress}</div>
          <div><strong>CARRIER:</strong> {order.courier?.name || 'Driver'}</div>
          <div><strong>DATE:</strong> {new Date().toLocaleDateString()}</div>
          <div><strong>TIME:</strong> {new Date().toLocaleTimeString()}</div>
        </div>
        
        <div className="w-full h-px border-t-2 border-dashed border-black my-6"></div>
        
        <div className="text-xl font-bold">✓ DELIVERED</div>
        <div className="text-xs mt-2">Thank you for using RayCast!</div>

        {/* Auto-print script for convenience */}
        <script dangerouslySetInnerHTML={{
          __html: `setTimeout(() => window.print(), 500);`
        }} />
      </div>
    </div>
  );
}
