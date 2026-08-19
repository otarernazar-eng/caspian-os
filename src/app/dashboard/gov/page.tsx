"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, ArrowRight, BarChart3, Clock, Map as MapIcon, Cpu, TrendingDown } from "lucide-react";
import LogisticsMap from "@/components/LogisticsMap";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GovDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSim, setShowSim] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard/gov")
      .then(res => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then(d => {
        if (d) {
          setData(d);
          setLoading(false);
        }
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2 font-mono text-text4 text-sm">
          <Activity className="w-4 h-4 animate-spin" />
          Synchronizing with regional nodes...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur border-b border-border1 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-accentWarm" />
          <span className="font-semibold tracking-tight text-lg">CaspianOS</span>
          <span className="px-2 py-1 bg-surface2 rounded text-xs font-mono text-text3 ml-4">Strategic Gov Node</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-text4 text-right">
            <div>UTC+5</div>
            <div>STATUS: <span className="text-[#7CF8E5]">NOMINAL</span></div>
          </div>
          <button onClick={() => {
            fetch("/api/auth/logout", { method: "POST" }).then(() => router.push("/"));
          }} className="btn">
            End Session
          </button>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Map & General Stats */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4 flex flex-col justify-between">
              <div className="text-xs font-mono text-text4 uppercase mb-2">Active Shipments</div>
              <div className="text-3xl font-bold">{data.stats.activeShipments}</div>
            </div>
            <div className="card p-4 flex flex-col justify-between">
              <div className="text-xs font-mono text-text4 uppercase mb-2">Throughput Vol.</div>
              <div className="text-3xl font-bold">{(data.stats.totalCargoWeight / 1000).toFixed(1)}k<span className="text-sm font-normal text-text4 ml-1">tons</span></div>
            </div>
            <div className="card p-4 flex flex-col justify-between border-red-900/30 bg-red-950/10">
              <div className="text-xs font-mono text-red-400 uppercase mb-2">Network Delay</div>
              <div className="text-3xl font-bold text-red-400">+{data.stats.averageDelay.toFixed(1)}h</div>
            </div>
            <div className="card p-4 flex flex-col justify-between">
              <div className="text-xs font-mono text-text4 uppercase mb-2">Economic Loss Risk</div>
              <div className="text-3xl font-bold">₸{(data.stats.economicLoss / 1000000).toFixed(1)}M</div>
            </div>
          </div>

          <div className="card flex-grow min-h-[500px] p-0 overflow-hidden relative border-border1">
            <div className="absolute top-4 left-4 z-10 bg-bg/90 backdrop-blur px-3 py-2 rounded-lg border border-border2 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-mono text-text2">
                <span className="w-2 h-2 rounded-full bg-accentWarm animate-pulse"></span>
                LIVE LOGISTICS CORRIDOR
              </div>
            </div>
            <LogisticsMap shipments={data.shipments} bottlenecks={data.bottlenecks} />
          </div>
        </div>

        {/* Right Column - Bottleneck & AI */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold">Bottleneck Radar</h2>
            </div>
            
            <div className="space-y-4">
              {data.bottlenecks.map((b: any) => (
                <div key={b.id} className="p-4 rounded-lg bg-surface2 border border-border2 hover:border-borderH1 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm text-text1">{b.location}</h3>
                    <span className={`chip ${b.severity === 'RED' ? 'text-red-400 border-red-500/30' : 'text-yellow-400'}`}>
                      {b.severity} RISK
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    <div className="text-xs flex justify-between">
                      <span className="text-text4">Affected Shipments:</span>
                      <span className="font-mono">{b.affectedCount}</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-text4">Avg Delay:</span>
                      <span className="font-mono text-red-400">+{b.averageDelay}h</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border1">
                    <div className="text-xs font-mono text-text4 mb-1">ROOT CAUSE</div>
                    <div className="text-sm text-text2">{b.rootCause}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#7CF8E5] to-[#C3FBFF]"></div>
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-[#7CF8E5]" />
              <h2 className="text-lg font-semibold">AI Intervention Proposal</h2>
            </div>

            {!showSim ? (
              <div className="space-y-4 animate-fade-in">
                <p className="text-sm text-text2 leading-relaxed">
                  <span className="font-semibold text-text1">Recommended Action:</span> Reallocate 2 transport vehicles and shift departure sequence for 4 active shipments near Aktau Port.
                </p>
                
                <div className="bg-surface2 rounded-lg p-3 space-y-2">
                  <div className="text-xs font-mono text-text4 mb-2">EXPECTED IMPACT</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text3">Average Delay</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">4.2h</span>
                      <ArrowRight className="w-3 h-3 text-text4" />
                      <span className="text-accentWarm font-semibold">1.7h</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text3">Affected Cargo</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">47</span>
                      <ArrowRight className="w-3 h-3 text-text4" />
                      <span className="text-accentWarm font-semibold">19</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text3">Estimated Savings</span>
                    <span className="text-[#7CF8E5] font-semibold">₸8.4M</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowSim(true)} className="btn flex-1 justify-center bg-surface2 border-border2 hover:bg-[#141414]">
                    Simulate
                  </button>
                  <button className="btn flex-1 justify-center bg-text1 text-bg hover:bg-text2 hover:text-bg font-medium border-none">
                    Apply <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-center p-6 border border-dashed border-[#7CF8E5]/30 rounded-lg bg-[#7CF8E5]/5">
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-[#7CF8E5] mx-auto mb-2 animate-pulse" />
                    <div className="text-sm font-semibold text-[#7CF8E5]">Simulation Complete</div>
                    <div className="text-xs text-text3 mt-1">Network throughput optimized by 34%</div>
                  </div>
                </div>
                <button className="btn w-full justify-center bg-text1 text-bg hover:bg-text2 hover:text-bg font-medium border-none">
                    Confirm & Apply Change <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <button onClick={() => setShowSim(false)} className="text-xs text-text4 hover:text-text2 block text-center w-full mt-2">
                  Cancel Simulation
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
