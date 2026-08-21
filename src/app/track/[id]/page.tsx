import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CheckCircle2, Truck, Package, MapPin, Clock, Satellite, ShieldCheck, User, Phone, Map, Image as ImageIcon, RotateCcw, BarChart2 } from "lucide-react";
import { getSession } from "@/lib/auth";

export default async function TrackPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const isGov = session?.role === "GOVERNMENT" || session?.role === "ADMIN";

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      courier: { include: { courierProfile: true } },
    }
  });

  if (!order) return notFound();

  // Determine active step based on status
  let step = 1;
  if (order.status === "ACCEPTED") step = 2;
  if (order.status === "DELIVERED") step = 3;

  return (
    <div className="min-h-screen bg-bg text-text1 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {isGov && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-red-500 shrink-0 mt-1" />
            <div>
              <h2 className="text-red-500 font-bold">GOVERNMENT ACCESS: CONFIDENTIAL DATA</h2>
              <p className="text-xs text-text3 mb-3">You are viewing this public tracking page with elevated Akimat privileges. All hidden logistics data is unmasked.</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm bg-bg/50 p-3 rounded border border-border1">
                <div>
                  <div className="text-text4 text-xs font-mono">Carrier IIN</div>
                  <div>{order.courier?.iin || "Not provided"}</div>
                </div>
                <div>
                  <div className="text-text4 text-xs font-mono">Carrier Phone</div>
                  <div>{order.courier?.phone || "Not provided"}</div>
                </div>
                <div>
                  <div className="text-text4 text-xs font-mono">Vehicle Plate</div>
                  <div>{order.courier?.courierProfile?.vehiclePlate || "N/A"}</div>
                </div>
                <div>
                  <div className="text-text4 text-xs font-mono">Transaction Value</div>
                  <div className="text-accentWarm font-bold">₸ {order.price}</div>
                </div>
                {order.courier?.courierProfile?.lastLat && (
                  <div className="col-span-2">
                    <div className="text-text4 text-xs font-mono">Raw GPS Coordinates</div>
                    <div className="font-mono text-[10px]">{order.courier.courierProfile.lastLat}, {order.courier.courierProfile.lastLng}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-surface1 border border-border1 rounded-2xl p-6 shadow-xl">
          <div className="text-center mb-6 pb-6 border-b border-border1 relative">
            <div className="absolute top-0 right-0 flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/30 animate-pulse">
              <Satellite className="w-3 h-3" />
              LIVE SATELLITE SYNC
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">RAYCAST</h1>
            <div className="text-text4 font-mono text-sm uppercase">Tracking Code: {order.id.slice(0, 8)}</div>
          </div>
          
          <div className="mt-6 flex flex-col items-center gap-2">
            <h2 className="text-2xl font-semibold text-accentWarm">{order.description}</h2>
            <div className="flex items-center gap-2 text-text3">
              <MapPin className="w-4 h-4"/> {order.destAddress}
            </div>
            {order.requiresRefrigeration && <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded text-xs uppercase font-bold mt-2">IoT Refrigeration Active</span>}
          </div>
        </div>

        {order.photoUrl && (
          <div className="bg-surface1 border border-border1 rounded-2xl p-6 shadow-xl mb-6">
            <h3 className="font-bold text-text1 mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Cargo Photo (At Dispatch)</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/2 rounded-lg overflow-hidden border border-border1 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={order.photoUrl} alt="Cargo condition at dispatch" className="w-full h-auto object-cover max-h-64"/>
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div className="text-sm text-text3">
                  This photo was securely attached by the seller during dispatch. If the cargo arrives in a different condition or doesn't match the photo, you can instantly claim a return using our AI.
                </div>
                <button className="btn bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-sm w-full justify-center py-3">
                  <RotateCcw className="w-4 h-4 mr-1" /> AI Return (Scan & Refund)
                </button>
              </div>
            </div>
          </div>
        )}

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
              <div className="text-sm text-text3">Order received and registered on the RayCast Exchange.</div>
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
              <div className="text-sm text-text3 mb-2">
                {step >= 2 
                  ? `Carrier assigned: ${order.courier?.name || 'Driver'}. On the way.` 
                  : "Waiting for carrier assignment..."}
              </div>
              
              {step >= 2 && order.estimatedTime && (
                <div className="bg-bg p-2 rounded border border-border1 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-text4">Estimated Time:</span>
                    <span className="font-bold text-text1">{Math.round(order.estimatedTime / 60)} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text4">Route Distance:</span>
                    <span className="font-bold text-text1">{Math.round((order.distance || 0) / 1000)} km</span>
                  </div>
                </div>
              )}
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

          <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-blue-400">Public Buyer Analytics (This Location)</h2>
            </div>
            <p className="text-sm text-text3 mb-4">
              Transparent supply chain data for consumer protection.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-bg/50 p-3 rounded border border-border1">
                <div className="text-text4 text-xs font-mono">Last Delivery</div>
                <div className="font-bold">2 days ago</div>
              </div>
              <div className="bg-bg/50 p-3 rounded border border-border1">
                <div className="text-text4 text-xs font-mono">Popular Item</div>
                <div className="font-bold truncate" title={order.description}>{order.description}</div>
              </div>
              <div className="bg-bg/50 p-3 rounded border border-border1">
                <div className="text-text4 text-xs font-mono">Price Transparency</div>
                <div className="font-bold text-accentWarm">₸ {order.price}</div>
              </div>
              <div className="bg-bg/50 p-3 rounded border border-border1">
                <div className="text-text4 text-xs font-mono">Supply Status</div>
                <div className="font-bold text-green-400">Stable</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
