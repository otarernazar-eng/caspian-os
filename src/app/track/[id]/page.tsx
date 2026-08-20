import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CheckCircle2, Truck, Package, MapPin, Clock } from "lucide-react";

export default async function TrackPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      courier: true,
    }
  });

  if (!order) return notFound();

  // Determine active step based on status
  let step = 1;
  if (order.status === "ACCEPTED") step = 2;
  if (order.status === "DELIVERED") step = 3;

  return (
    <div className="min-h-screen bg-bg text-text1 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-surface1 border border-border1 rounded-2xl p-6 shadow-xl">
        
        <div className="text-center mb-8 pb-8 border-b border-border1">
          <h1 className="text-3xl font-bold tracking-tight mb-2">CASPIAN OS</h1>
          <div className="text-text4 font-mono text-sm uppercase">Tracking Code: {order.id.slice(0, 8)}</div>
          
          <div className="mt-6 flex flex-col items-center gap-2">
            <h2 className="text-2xl font-semibold text-accentWarm">{order.description}</h2>
            <div className="flex items-center gap-2 text-text3">
              <MapPin className="w-4 h-4"/> {order.destAddress}
            </div>
            {order.requiresRefrigeration && <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded text-xs uppercase font-bold mt-2">IoT Refrigeration Active</span>}
          </div>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border2 before:to-transparent">
          
          {/* Step 1: Created */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-bg ${step >= 1 ? 'bg-accentWarm' : 'bg-surface2'} text-bg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow`}>
              <Package className="w-4 h-4" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border1 bg-surface2 shadow">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-text1">Shipment Created</h3>
              </div>
              <div className="text-sm text-text3">Order received and registered on the Caspian OS Exchange.</div>
            </div>
          </div>

          {/* Step 2: Assigned & Transit */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-bg ${step >= 2 ? 'bg-accentWarm' : 'bg-surface2'} text-bg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow`}>
              <Truck className="w-4 h-4" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border1 bg-surface2 shadow">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-text1">In Transit</h3>
              </div>
              <div className="text-sm text-text3">
                {step >= 2 
                  ? `Carrier assigned: ${order.courier?.name || 'Driver'}. On the way.` 
                  : "Waiting for carrier assignment..."}
              </div>
            </div>
          </div>

          {/* Step 3: Delivered */}
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-bg ${step >= 3 ? 'bg-green-400' : 'bg-surface2'} text-bg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border1 bg-surface2 shadow">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-text1">Delivered</h3>
              </div>
              <div className="text-sm text-text3">
                {step === 3 ? "Delivery completed successfully." : "Pending arrival."}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
