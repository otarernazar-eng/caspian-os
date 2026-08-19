"use client";

import { useEffect, useState } from "react";
import { Activity, MapPin, Box, Thermometer, Clock, CheckCircle2, QrCode } from "lucide-react";
import Link from "next/link";
import LogisticsMap from "@/components/LogisticsMap";

export default function CargoPassport({ params }: { params: { cargoId: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // In a real app, we'd fetch using params.cargoId. For hackathon MVP, we fetch the seeded one.
  useEffect(() => {
    fetch("/api/public/track/" + params.cargoId)
      .then(res => res.json())
      .then(d => {
        setData(d.shipment);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.cargoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2 font-mono text-text4 text-sm">
          <Activity className="w-4 h-4 animate-spin" />
          Retrieving Digital Twin...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text3">Cargo Record Not Found</div>
      </div>
    );
  }

  const isDemo = params.cargoId === 'demo';

  return (
    <div className="min-h-screen bg-bg pb-20">
      <header className="border-b border-border1 px-6 py-4 flex items-center justify-between bg-surface1">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-accentWarm" />
          <span className="font-semibold tracking-tight">CaspianOS Passport</span>
        </div>
        <div className="chip border-green-500/30 text-green-400">
          <CheckCircle2 className="w-3 h-3 mr-1" /> VERIFIED
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 mt-6 space-y-6 animate-fade-in-up">
        
        <div className="text-center mb-10">
          <QrCode className="w-16 h-16 text-text4 mx-auto mb-4 opacity-50" />
          <h1 className="text-3xl font-bold tracking-tight text-text1 mb-2">{data.trackingId}</h1>
          <p className="text-text3 font-mono text-sm uppercase tracking-widest">{data.cargo[0]?.type}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 text-text4 text-xs font-mono mb-2 uppercase">
              <MapPin className="w-4 h-4" /> Origin
            </div>
            <div className="text-lg font-medium">{data.origin}</div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-text4 text-xs font-mono mb-2 uppercase">
              <MapPin className="w-4 h-4" /> Destination
            </div>
            <div className="text-lg font-medium">{data.destination}</div>
          </div>
          
          <div className="card p-4 border-accentWarm/30">
            <div className="flex items-center gap-2 text-text4 text-xs font-mono mb-2 uppercase">
              <Clock className="w-4 h-4" /> ETA
            </div>
            <div className="text-2xl font-semibold text-accentWarm">
              {new Date(data.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {data.originalEta && new Date(data.eta) > new Date(data.originalEta) && (
              <div className="text-xs text-red-400 mt-1">Delayed from {new Date(data.originalEta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            )}
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 text-text4 text-xs font-mono mb-2 uppercase">
              <Thermometer className="w-4 h-4" /> Current Temp
            </div>
            <div className="text-2xl font-semibold text-[#7CF8E5]">
              +{data.cargo[0]?.temperature}°C
            </div>
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Box className="w-5 h-5 text-text3" /> Live Location
          </h2>
          <div className="h-[300px] w-full bg-surface2 rounded-lg overflow-hidden">
             <LogisticsMap shipments={[data]} bottlenecks={[]} />
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="text-lg font-semibold mb-4">Chain of Custody</h2>
          <div className="space-y-4">
            {['VERIFIED', 'DEPARTED', 'CHECKPOINT', 'IN TRANSIT'].map((step, i) => (
              <div key={step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${i <= 3 ? 'bg-accentWarm' : 'bg-surface2 border border-border2'}`}></div>
                  {i < 3 && <div className={`w-px h-full ${i < 3 ? 'bg-accentWarm' : 'bg-border2'} mt-1`}></div>}
                </div>
                <div className="pb-4">
                  <div className="font-medium text-sm">{step}</div>
                  <div className="text-xs font-mono text-text4">System Verified</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {isDemo && (
           <div className="mt-8 text-center">
              <Link href="/" className="link-dotted text-text4 hover:text-text2 font-mono text-sm">
                Return to CaspianOS
              </Link>
           </div>
        )}

      </main>
    </div>
  );
}
