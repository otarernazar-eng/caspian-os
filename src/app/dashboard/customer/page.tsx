"use client";

import { useEffect, useState } from "react";
import { Activity, Plus, Package, MapPin, Truck, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Form State
  const [destAddress, setDestAddress] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

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
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/dashboard/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destAddress,
          description,
          price,
          destLat: 43.6481 + (Math.random() - 0.5) * 0.1, // Simulated mock coordinates for MVP
          destLng: 51.1983 + (Math.random() - 0.5) * 0.1,
        })
      });
      if (res.ok) {
        setShowModal(false);
        setDestAddress("");
        setDescription("");
        setPrice("");
        fetchOrders();
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
          <span className="font-semibold text-lg">Customer Portal</span>
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
                  <h3 className="font-semibold text-lg mb-1">{order.description}</h3>
                  <div className="text-xl font-bold text-accentWarm mb-4">₸ {order.price}</div>
                  
                  <div className="space-y-2 text-sm text-text3">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {order.destAddress}</div>
                    {order.courier && (
                      <div className="flex items-center gap-2 text-text1">
                        <Truck className="w-4 h-4 text-accentWarm" /> 
                        {order.courier.name} ({order.courier.courierProfile?.vehicleBrand} - {order.courier.courierProfile?.vehiclePlate})
                      </div>
                    )}
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
                <label className="text-xs text-text4">Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-surface2 border border-border2 rounded p-2" required placeholder="What needs to be delivered?" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text4">Destination Address (Point B)</label>
                <input type="text" value={destAddress} onChange={e => setDestAddress(e.target.value)} className="w-full bg-surface2 border border-border2 rounded p-2" required placeholder="Full address" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text4">Price (₸)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-surface2 border border-border2 rounded p-2" required min="100" />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn flex-1 bg-transparent">Cancel</button>
                <button type="submit" className="btn flex-1 bg-text1 text-bg hover:bg-text2 hover:text-bg">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
