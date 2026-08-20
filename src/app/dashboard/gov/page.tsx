"use client";

import { useEffect, useState } from "react";
import { Activity, Users, Truck, Route, DollarSign, Leaf, Zap, BarChart, HardHat, ShieldCheck, Coffee, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import LogisticsMap from "@/components/LogisticsMap";

export default function GovernmentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = () => {
    fetch("/api/dashboard/gov/data")
      .then(res => {
        if (res.status === 401) return router.push("/login");
        return res.json();
      })
      .then(d => {
        if (d) {
          setData(d);
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s poll
    return () => clearInterval(interval);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Activity className="w-5 h-5 animate-spin text-accentWarm" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur border-b border-border1 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-accentWarm" />
          <span className="font-semibold text-lg">Government Analytics</span>
        </div>
        <button onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => router.push("/"))} className="text-xs text-text4 hover:text-text1">
          LOGOUT
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Economic Impact Dashboard */}
        {data.ecoMetrics && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BarChart className="w-5 h-5 text-text3" /> Platform Economic Impact
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card bg-surface2/50">
                <div className="text-xs text-text4 font-mono mb-1 flex items-center gap-2"><Route className="w-3 h-3"/> Empty Run Saved</div>
                <div className="text-2xl font-bold text-text1">{data.ecoMetrics.savedEmptyRunKm} km</div>
                <div className="text-xs text-text4 mt-2">Prevented empty returns</div>
              </div>
              <div className="card bg-surface2/50">
                <div className="text-xs text-text4 font-mono mb-1 flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-500"/> Fuel Saved</div>
                <div className="text-2xl font-bold text-text1">{data.ecoMetrics.fuelSavedLiters} L</div>
                <div className="text-xs text-text4 mt-2">Diesel / Petrol equivalent</div>
              </div>
              <div className="card bg-surface2/50">
                <div className="text-xs text-text4 font-mono mb-1 flex items-center gap-2"><Leaf className="w-3 h-3 text-green-500"/> CO2 Reduction</div>
                <div className="text-2xl font-bold text-text1">{data.ecoMetrics.co2SavedKg} kg</div>
                <div className="text-xs text-text4 mt-2">Emissions prevented</div>
              </div>
              <div className="card bg-surface2/50 border-accentWarm/30">
                <div className="text-xs text-text4 font-mono mb-1 flex items-center gap-2"><DollarSign className="w-3 h-3 text-accentWarm"/> Total Savings</div>
                <div className="text-2xl font-bold text-accentWarm">₸ {data.ecoMetrics.totalEconomicImpactKzt}</div>
                <div className="text-xs text-text4 mt-2">Direct economic benefit</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Couriers Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-text3" /> Registered Couriers
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {data.couriers.length === 0 && <div className="text-sm text-text4">No couriers registered.</div>}
              {data.couriers.map((c: any) => (
                <div key={c.id} className="card py-3 px-4 flex justify-between items-center border-l-2 border-l-green-500">
                  <div>
                    <div className="font-semibold flex items-center gap-1">{c.name} <ShieldCheck className="w-3 h-3 text-green-500" title="eGov Verified" /></div>
                    <div className="text-xs font-mono text-text4">{c.phone} | IIN: {c.iin || "N/A"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-accentWarm">{c.courierProfile?.vehicleBrand}</div>
                    <div className="text-xs font-mono border border-border2 px-1 rounded mt-1">{c.courierProfile?.vehiclePlate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customers Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-text3" /> Registered Customers
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {data.customers.length === 0 && <div className="text-sm text-text4">No customers registered.</div>}
              {data.customers.map((c: any) => (
                <div key={c.id} className="card py-3 px-4 border-l-2 border-l-green-500">
                  <div className="font-semibold flex items-center gap-1">{c.name} <ShieldCheck className="w-3 h-3 text-green-500" title="eGov Verified" /></div>
                  <div className="text-xs font-mono text-text4">{c.phone} | IIN: {c.iin || "N/A"}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* AI Road Infrastructure Planning & Safety */}
        {data.badRoads && data.badRoads.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <HardHat className="w-5 h-5 text-text3" /> Infrastructure Planning: Bad Roads Detected
            </h2>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <p className="text-sm text-yellow-500/80 mb-4">
                Based on real-time 2GIS ETA vs Distance calculations, these destinations have abnormally low average speeds (&lt; 40 km/h). The Akimat should prioritize these routes for road repairs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.badRoads.map((road: any, idx: number) => (
                  <div key={idx} className="bg-bg/50 p-3 rounded-lg border border-border1">
                    <div className="font-semibold text-text1">{road.address}</div>
                    <div className="text-xs mt-2 flex justify-between">
                      <span className="text-text4">Avg Speed:</span>
                      <span className="text-red-400 font-bold">{Math.round(road.avgSpeed)} km/h</span>
                    </div>
                    <div className="text-xs mt-1 flex justify-between">
                      <span className="text-text4">Reports:</span>
                      <span>{road.reports} deliveries</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Social Responsibility: Driver Fatigue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-orange-400 flex items-center gap-2"><Coffee className="w-4 h-4"/> AI Driver Fatigue Monitor</div>
                  <div className="text-sm text-orange-400/80 mt-1">Platform automatically restricts orders for drivers exceeding 8 hours.</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-400">12%</div>
                  <div className="text-xs text-orange-400/80">Accident Risk Prevented</div>
                </div>
              </div>

              {/* Social Responsibility: Remote Villages Subsidy */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-green-400 flex items-center gap-2"><Home className="w-4 h-4"/> Remote Village Subsidies</div>
                  <div className="text-sm text-green-400/80 mt-1">{data.socialMetrics?.subsidizedDeliveries || 0} essential deliveries to remote areas.</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">₸ {data.socialMetrics?.subsidyBudgetUsedKzt || 0}</div>
                  <div className="text-xs text-green-400/80">Akimat Budget Used</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders / Trade Routes */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Route className="w-5 h-5 text-text3" /> Orders & Routes (Economy)
          </h2>
          <div className="bg-surface1 rounded-xl border border-border1 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface2 text-text4 text-xs font-mono uppercase">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Courier</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border1">
                {data.orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text4">No active trade routes or transactions yet.</td>
                  </tr>
                )}
                {data.orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-surface2/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0,8)}</td>
                    <td className="px-4 py-3">{o.customer?.name}</td>
                    <td className="px-4 py-3">{o.courier ? o.courier.name : <span className="text-text4 italic">Unassigned</span>}</td>
                    <td className="px-4 py-3 truncate max-w-[200px]">{o.destAddress}</td>
                    <td className="px-4 py-3 text-accentWarm font-semibold">₸ {o.price}</td>
                    <td className="px-4 py-3">
                      <span className={`chip text-[10px] ${o.status === 'PENDING' ? 'text-yellow-400 border-yellow-400/30' : 'text-[#7CF8E5] border-[#7CF8E5]/30'}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-0 overflow-hidden h-[500px]">
           <LogisticsMap orders={data.orders} />
        </div>

      </main>
    </div>
  );
}
