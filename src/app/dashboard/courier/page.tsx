"use client";

import { useEffect, useState } from "react";
import { Activity, MapPin, Navigation, DollarSign, Check } from "lucide-react";
import { useRouter } from "next/navigation";

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

    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(
        (pos) => {
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
        console.error,
        { enableHighAccuracy: true }
      );
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
          <span className="font-semibold text-lg">Courier Portal</span>
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
                   <div className="font-semibold text-xl">{data.activeOrder.description}</div>
                 </div>
                 <div className="text-2xl font-bold text-accentWarm">₸ {data.activeOrder.price}</div>
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

               {data.activeOrder.estimatedTime && (
                 <div className="mt-6 p-3 bg-surface2 rounded-lg flex justify-between items-center text-sm">
                   <span className="text-text4">Est. Route Time (2GIS)</span>
                   <span className="font-bold">{Math.round(data.activeOrder.estimatedTime / 60)} min</span>
                 </div>
               )}

               <button className="btn w-full justify-center mt-6 py-4 bg-accentWarm text-bg hover:bg-[#d49938] border-none text-base font-semibold">
                 Complete Delivery
               </button>
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
                    <h3 className="font-semibold text-lg">{order.description}</h3>
                    <div className="text-xl font-bold text-accentWarm">₸ {order.price}</div>
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
