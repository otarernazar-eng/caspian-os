"use client";

import { useEffect, useState } from "react";
import { Activity, Plus, Package, MapPin, Truck, Check, ShieldCheck, ThermometerSnowflake, Home, Printer, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newlyCreatedOrderId, setNewlyCreatedOrderId] = useState<string | null>(null);
  const [appOrigin, setAppOrigin] = useState("https://caspian-os.vercel.app");
  const router = useRouter();

  // Form State
  const [destAddress, setDestAddress] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [weightTons, setWeightTons] = useState("");
  const [requiresRefrigeration, setRequiresRefrigeration] = useState(false);
  const [isRemoteVillage, setIsRemoteVillage] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1586528116311-ad8ed7c50a63?auto=format&fit=crop&w=300&q=80");
  const [aiLoading, setAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const analyzePhotoWithAI = async () => {
    if (!photoUrl) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/parse/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl })
      });
      if (res.ok) {
        const data = await res.json();
        setDescription(data.description);
        setRequiresRefrigeration(data.requiresRefrigeration);
        // We explicitly DO NOT set price, destAddress, or isRemoteVillage 
        // so the human has to fill them out manually.
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchOrders = () => {
    fetch("/api/dashboard/customer/orders")
      .then(res => {
        if (res.status === 401) return router.push("/login");
        return res.json();
      })
      .then(d => {
        if (d && d.orders) {
          setOrders(d.orders);
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAppOrigin(window.location.origin);
    }
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Geocode the address using free Nominatim API to ensure REAL coordinates on land (not in the Caspian Sea)
      let destLat = 43.6481;
      let destLng = 51.1983;

      try {
        // Append Mangistau region to improve geocoding accuracy
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destAddress + ", Mangistau, Kazakhstan")}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            destLat = parseFloat(geoData[0].lat);
            destLng = parseFloat(geoData[0].lon);
          }
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }

      const res = await fetch("/api/dashboard/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destAddress,
          description,
          price,
          weightTons,
          destLat,
          destLng,
          requiresRefrigeration,
          isRemoteVillage,
          photoUrl
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order && data.order.id) {
           setNewlyCreatedOrderId(data.order.id);
        }
        setShowModal(false);
        setDestAddress("");
        setDescription("");
        setPrice("");
        setWeightTons("");
        setRequiresRefrigeration(false);
        setIsRemoteVillage(false);
        fetchOrders();
      } else {
        const errData = await res.json();
        alert("Ошибка при создании заказа: " + (errData.error || "Неизвестная ошибка"));
      }
    } catch (e) {
      console.error(e);
      alert("Сетевая ошибка при создании заказа.");
    } finally {
      setIsSubmitting(false);
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
          <span className="font-semibold text-lg flex items-center gap-2">Customer Portal <ShieldCheck className="w-4 h-4 text-green-500" /></span>
        </div>
        <button onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => router.push("/"))} className="text-xs text-text4 hover:text-text1">
          LOGOUT
        </button>
      </header>

      <main className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <button onClick={() => setShowModal(true)} className="btn bg-accentWarm text-bg hover:bg-[#d49938] border-none flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Order
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.length === 0 ? (
            <div className="col-span-full text-center text-text4 py-12 border border-dashed border-border2 rounded-lg">
              No orders yet. Create one to get started.
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="card flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-mono text-text4">#{order.id.slice(0,8)}</span>
                    <span className={`chip ${order.status === 'PENDING' ? 'text-yellow-400 border-yellow-400/30' : 'text-[#7CF8E5] border-[#7CF8E5]/30'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    {order.photoUrl && (
                      <div className="w-16 h-16 rounded overflow-hidden shrink-0 border border-border1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={order.photoUrl} alt="Cargo" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h3 className="font-semibold text-lg mb-1">{order.description}</h3>
                  </div>
                  <div className="text-xl font-bold text-accentWarm mb-4">₸ {order.price}</div>
                  
                  <div className="space-y-2 text-sm text-text3">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {order.destAddress}</div>
                    {order.courier && (
                      <div className="flex flex-col gap-1 text-text1 bg-surface2 p-3 rounded-lg border border-border2">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-accentWarm" /> 
                          <span className="font-semibold">{order.courier.name}</span> ({order.courier.courierProfile?.vehicleBrand} - {order.courier.courierProfile?.vehiclePlate})
                        </div>
                        {order.estimatedTime && (
                          <div className="text-xs text-text4 flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3"/> ETA: {Math.round(order.estimatedTime / 60)} min
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border1 flex flex-col sm:flex-row gap-2">
                    <Link href={`/track/${order.id}`} target="_blank" className="btn flex-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 justify-center text-xs">
                      <Activity className="w-4 h-4 mr-1" /> Live Track
                    </Link>
                    <Link href={`/print/label/${order.id}?origin=${encodeURIComponent(appOrigin)}`} target="_blank" className="btn flex-1 bg-surface2 text-text2 hover:text-text1 hover:bg-surface3 border border-border2 justify-center text-xs">
                      <Printer className="w-4 h-4 mr-1" /> Print QR
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="card w-full max-w-md animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-4">New Delivery Order</h2>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-text4">Cargo Photo (Required)</label>
                <div className="flex gap-2">
                  <input type="text" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="w-full bg-surface2 border border-border2 rounded p-2 text-xs" required />
                  <button type="button" onClick={analyzePhotoWithAI} disabled={aiLoading} className="btn bg-surface2 px-2 text-xs border border-border2 min-w-[80px] justify-center">
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin text-accentWarm" /> : "📸 Use AI"}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text4">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-surface2 border border-border2 rounded p-2" required placeholder="What needs to be delivered?" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text4">Destination Address (Point B)</label>
                <input type="text" value={destAddress} onChange={e => setDestAddress(e.target.value)} className="w-full bg-surface2 border border-border2 rounded p-2" required placeholder="Full address" />
              </div>
              <div className="flex gap-4">
                <div className="space-y-1 flex-1">
                  <label className="text-xs text-text4">Price (₸)</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-surface2 border border-border2 rounded p-2" required min="100" />
                </div>
                <div className="space-y-1 flex-1">
                  <label className="text-xs text-text4">Weight (Tons)</label>
                  <input type="number" step="0.1" value={weightTons} onChange={e => setWeightTons(e.target.value)} className="w-full bg-surface2 border border-border2 rounded p-2" required min="0.1" placeholder="e.g. 1.5" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-2 bg-blue-500/10 p-3 rounded border border-blue-500/30">
                <input type="checkbox" checked={requiresRefrigeration} onChange={e => setRequiresRefrigeration(e.target.checked)} className="accent-blue-500 w-4 h-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-blue-400 flex items-center gap-1"><ThermometerSnowflake className="w-4 h-4"/> Perishable Cargo (IoT Cooling req.)</span>
                  <span className="text-xs text-text4">Requires vehicle with IoT temperature tracking (e.g. food/medicine)</span>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer mt-2 bg-green-500/10 p-3 rounded border border-green-500/30">
                <input type="checkbox" checked={isRemoteVillage} onChange={e => setIsRemoteVillage(e.target.checked)} className="accent-green-500 w-4 h-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-green-400 flex items-center gap-1"><Home className="w-4 h-4"/> Remote Village / Subsidized Route</span>
                  <span className="text-xs text-text4">Essential goods delivery to remote areas (eligible for Akimat subsidy)</span>
                </div>
              </label>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting} className="btn flex-1 bg-transparent">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn flex-1 bg-text1 text-bg hover:bg-text2 hover:text-bg">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post-Creation Success Modal with QR */}
      {newlyCreatedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-sm animate-fade-in-up flex flex-col items-center text-center">
            <Check className="w-12 h-12 text-[#7CF8E5] mb-4 bg-[#7CF8E5]/10 p-2 rounded-full" />
            <h2 className="text-xl font-bold mb-2">Shipment Created!</h2>
            <p className="text-sm text-text3 mb-6">Scan the QR code below to track your cargo publicly without an account.</p>
            
            <div className="bg-white p-4 rounded-xl mb-6 shadow-[0_0_20px_rgba(124,248,229,0.3)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${appOrigin}/track/${newlyCreatedOrderId}`)}`} 
                alt="Tracking QR Code" 
                width={200} 
                height={200} 
              />
            </div>

            <div className="flex flex-col w-full gap-3">
              <a 
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${appOrigin}/track/${newlyCreatedOrderId}`)}`} 
                download={`RayCast_QR_${newlyCreatedOrderId.slice(0,8)}.png`} 
                target="_blank" 
                className="btn bg-accentWarm text-bg hover:bg-[#d49938] border-none flex-1 w-full justify-center font-bold"
              >
                Download QR Image
              </a>
              <button 
                onClick={() => window.open(`/print/label/${newlyCreatedOrderId}?origin=${encodeURIComponent(appOrigin)}`, '_blank')} 
                className="btn bg-surface2 text-text1 hover:bg-surface3 border border-border2 flex-1 w-full justify-center"
              >
                <Printer className="w-4 h-4 mr-2" /> Print Thermal Label
              </button>
              <button 
                onClick={() => setNewlyCreatedOrderId(null)} 
                className="btn bg-transparent flex-1 w-full justify-center mt-2 text-text4 hover:text-text1"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
