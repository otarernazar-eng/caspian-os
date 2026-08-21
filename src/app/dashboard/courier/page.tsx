"use client";

import { useEffect, useState } from "react";
import { Activity, MapPin, Navigation, DollarSign, Check, Sparkles, CloudRainWind, ShieldCheck, ThermometerSnowflake, Coffee, Home, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import LogisticsMap from "@/components/LogisticsMap";

export default function CourierDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const router = useRouter();

  const fetchData = () => {
    fetch("/api/dashboard/courier/orders")
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
    const interval = setInterval(fetchData, 5000); // Polling for new orders

    const useMockLocation = () => {
      // Fallback to 6-й микрорайон, 50, Aktau for demo
      const lat = 43.6394;
      const lng = 51.1557;
      setCurrentLocation({ lat, lng });
      fetch("/api/dashboard/courier/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng })
      }).catch(console.error);
    };

    let mockTimeout: any;

    if ("geolocation" in navigator) {
      // If GPS doesn't respond in 3 seconds, use mock to prevent demo blocking
      mockTimeout = setTimeout(useMockLocation, 3000);

      navigator.geolocation.watchPosition(
        (pos) => {
          clearTimeout(mockTimeout);
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLocation({ lat, lng });
          
          // Send location to server
          fetch("/api/dashboard/courier/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng })
          }).catch(console.error);
        },
        (error) => {
          console.error("GPS Error:", error);
          clearTimeout(mockTimeout);
          useMockLocation(); // Fallback on error (e.g. Permission Denied)
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      useMockLocation();
    }

    return () => clearInterval(interval);
  }, [router]);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await fetch("/api/dashboard/courier/orders/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId,
          courierLat: currentLocation?.lat,
          courierLng: currentLocation?.lng
        })
      });
      if (res.ok) {
        fetchData(); // refresh
      }
    } catch (e) {
      console.error(e);
    }
  };

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
          <span className="font-semibold text-lg flex items-center gap-2">Courier Portal <ShieldCheck className="w-4 h-4 text-green-500" /></span>
        </div>
        <button onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => router.push("/"))} className="text-xs text-text4 hover:text-text1">
          LOGOUT
        </button>
      </header>

      <main className="p-6 max-w-2xl mx-auto space-y-6">
        
        {!currentLocation && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-yellow-500 text-sm">
            Please allow location access to receive and accept orders.
          </div>
        )}

        {data.activeOrder ? (
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-2xl font-bold">Active Delivery</h1>
            <div className="card border-borderH1">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <div className="text-xs font-mono text-text4 mb-1">Customer: {data.activeOrder.customer.name}</div>
                   <div className="font-semibold text-xl flex items-center gap-2">
                     {data.activeOrder.description}
                     {data.activeOrder.isRemoteVillage && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30 uppercase tracking-wider">Gov Subsidy Route</span>}
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="text-2xl font-bold text-accentWarm flex items-center gap-1 justify-end">₸ {data.activeOrder.price}</div>
                   {data.activeOrder.isRemoteVillage && <div className="text-xs text-green-400 font-mono">+ 20% Akimat Bonus</div>}
                 </div>
               </div>

               <div className="space-y-3 pt-4 border-t border-border1">
                 <div className="flex items-center gap-3 text-sm">
                   <div className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center">
                     <Navigation className="w-4 h-4 text-text2" />
                   </div>
                   <div>
                     <div className="text-text4 text-xs font-mono">Current Location</div>
                     <div className="text-text1">Your GPS Position</div>
                   </div>
                 </div>
                 <div className="w-0.5 h-4 bg-border2 ml-4"></div>
                 <div className="flex items-center gap-3 text-sm">
                   <div className="w-8 h-8 rounded-full bg-accentWarm/20 flex items-center justify-center">
                     <MapPin className="w-4 h-4 text-accentWarm" />
                   </div>
                   <div>
                     <div className="text-text4 text-xs font-mono">Destination</div>
                     <div className="text-text1">{data.activeOrder.destAddress}</div>
                   </div>
                 </div>
               </div>

               {/* AI Fuel & Profit Analysis */}
               {data.activeOrder.distance && (
                 <div className="mt-4 bg-surface2 rounded-xl p-4 border border-border1 text-sm space-y-3">
                   <div className="flex justify-between items-center text-text4 text-xs font-mono mb-2">
                     <span>AI Fleet Analytics</span>
                     <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded">OPTIMIZED</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-text3">Estimated Fuel needed:</span>
                     <span className="font-bold text-text1">{((data.activeOrder.distance / 1000) * 0.12).toFixed(1)} Liters</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-text3">Fuel Cost (approx 295₸/L):</span>
                     <span className="font-bold text-red-400">- ₸ {Math.round((data.activeOrder.distance / 1000) * 0.12 * 295)}</span>
                   </div>
                   <div className="w-full h-px bg-border1 my-1"></div>
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-text1">Estimated Net Profit:</span>
                     <span className="font-bold text-green-400 text-lg">₸ {data.activeOrder.price - Math.round((data.activeOrder.distance / 1000) * 0.12 * 295)}</span>
                   </div>
                 </div>
               )}

                {/* IoT Refrigeration Sensor */}
                {data.activeOrder.requiresRefrigeration && (
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-2 text-blue-400">
                      <ThermometerSnowflake className="w-5 h-5" />
                      <div className="text-sm font-bold">IoT Cargo Sensor</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-mono font-bold text-blue-400">+4.2°C</div>
                      <div className="text-[10px] text-text4 uppercase">Cooling Active</div>
                    </div>
                  </div>
                )}

               {data.activeOrder.estimatedTime && (
                 <div className="mt-6 p-3 bg-surface2 rounded-lg flex justify-between items-center text-sm">
                   <span className="text-text4">Est. Route Time (2GIS)</span>
                   <span className="font-bold">{Math.round(data.activeOrder.estimatedTime / 60)} min</span>
                 </div>
               )}

               <button 
                 onClick={async () => {
                   await fetch("/api/dashboard/courier/orders/complete", {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({ orderId: data.activeOrder.id })
                   });
                   window.open(`/print/receipt/${data.activeOrder.id}`, "_blank");
                   fetchData();
                 }}
                 className="btn w-full justify-center mt-6 py-4 bg-accentWarm text-bg hover:bg-[#d49938] border-none text-base font-semibold"
               >
                 Complete Delivery & Print Receipt
               </button>
            </div>
            
            <div className="card p-0 overflow-hidden h-[400px]">
               <LogisticsMap orders={[data.activeOrder]} />
            </div>

            {/* AI Smart Match (Combine Cargo) */}
            {data.smartMatchCombineOrder && (
              <div className="card border-[#7CF8E5]/50 bg-[#7CF8E5]/5 animate-fade-in mt-4">
                 <div className="flex items-center gap-2 mb-2">
                   <Package className="w-5 h-5 text-[#7CF8E5]" />
                   <h2 className="text-lg font-bold text-[#7CF8E5]">AI Match: Combine Cargo</h2>
                 </div>
                 <p className="text-sm text-text3 mb-4">
                   This order goes to exactly the same destination ({data.smartMatchCombineOrder.destAddress.split(',')[0]}). Take it to double your earnings on the same route!
                 </p>
                 <div className="flex justify-between items-center bg-bg/50 p-3 rounded-lg border border-border1">
                   <div>
                     <div className="text-sm font-semibold">{data.smartMatchCombineOrder.customer?.name} &rarr; {data.smartMatchCombineOrder.destAddress}</div>
                     <div className="text-xs text-text4 mt-1">{data.smartMatchCombineOrder.description}</div>
                   </div>
                   <div className="text-right flex flex-col items-end">
                     <div className="text-lg font-bold text-text1">+ ₸ {data.smartMatchCombineOrder.price}</div>
                     <button onClick={() => handleAcceptOrder(data.smartMatchCombineOrder.id)} className="text-xs bg-[#7CF8E5] text-bg px-3 py-1 rounded mt-1 font-bold hover:bg-[#5ae6d1]">Combine Route</button>
                   </div>
                 </div>
              </div>
            )}

            {/* AI Smart Match (Return Cargo) */}
            {data.smartMatchOrder && (
              <div className="card border-accentWarm/50 bg-accentWarm/5 animate-fade-in mt-4">
                 <div className="flex items-center gap-2 mb-2">
                   <Sparkles className="w-5 h-5 text-accentWarm" />
                   <h2 className="text-lg font-bold text-accentWarm">AI Match: Return Cargo</h2>
                 </div>
                 <p className="text-sm text-text3 mb-4">
                   Based on your current destination, we found a real pending order nearby. Accept it now to minimize empty run.
                 </p>
                 <div className="flex justify-between items-center bg-bg/50 p-3 rounded-lg border border-border1">
                   <div>
                     <div className="text-sm font-semibold">{data.smartMatchOrder.customer?.name} &rarr; {data.smartMatchOrder.destAddress}</div>
                     <div className="text-xs text-text4 mt-1">{data.smartMatchOrder.description}</div>
                   </div>
                   <div className="text-right flex flex-col items-end">
                     <div className="text-lg font-bold text-text1">+ ₸ {data.smartMatchOrder.price}</div>
                     <button onClick={() => handleAcceptOrder(data.smartMatchOrder.id)} className="text-xs bg-accentWarm text-bg px-3 py-1 rounded mt-1 font-bold hover:bg-[#d49938]">Queue Order</button>
                   </div>
                 </div>
              </div>
            )}

            {/* Weather Alert (Mangistau Reality Check) */}
            {data.weatherAlert && (
              <div className="card border-blue-500/30 bg-blue-500/5 mt-4 flex items-center gap-3">
                <CloudRainWind className="w-6 h-6 text-blue-400" />
                <div>
                  <div className="text-sm font-bold text-blue-400">Mangistau Regional Weather</div>
                  <div className="text-xs text-text3">{data.weatherAlert}</div>
                </div>
              </div>
            )}
            
            {/* Driver Fatigue Alert */}
            <div className="card border-orange-500/30 bg-orange-500/5 mt-4 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <Coffee className="w-6 h-6 text-orange-400" />
                 <div>
                   <div className="text-sm font-bold text-orange-400">AI Fatigue Monitor</div>
                   <div className="text-xs text-text3">Active Driving Time: 4h 15m</div>
                 </div>
               </div>
               <div className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-1 rounded">REST RECOMMENDED</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Available Orders</h1>
            {data.pendingOrders.length === 0 ? (
              <div className="text-center text-text4 py-12 border border-dashed border-border2 rounded-lg">
                Looking for new orders nearby...
              </div>
            ) : (
              data.pendingOrders.map((order: any) => (
                <div key={order.id} className="card hover:border-borderH1 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2 flex-wrap">
                      {order.description} 
                      {order.requiresRefrigeration && <ThermometerSnowflake className="w-4 h-4 text-blue-400" />}
                      {order.isRemoteVillage && <Home className="w-4 h-4 text-green-400" />}
                    </h3>
                    <div className="text-right">
                      <div className="text-xl font-bold text-accentWarm">₸ {order.price}</div>
                      {order.isRemoteVillage && <div className="text-[10px] text-green-400 mt-1 uppercase">+20% Subsidy</div>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-text3 mb-4">
                    <MapPin className="w-4 h-4" /> {order.destAddress}
                  </div>

                  <button 
                    onClick={() => handleAcceptOrder(order.id)}
                    disabled={!currentLocation}
                    className="btn w-full justify-center bg-text1 text-bg hover:bg-text2 hover:text-bg">
                    Accept Order
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
