"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, User as UserIcon, Phone, FileText, Truck, Activity } from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState("CUSTOMER");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [iin, setIin] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone, password, role, name, iin, vehiclePlate, vehicleBrand
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user.role === "GOVERNMENT" || data.user.role === "ADMIN") {
          router.push("/dashboard/gov");
        } else if (data.user.role === "COURIER") {
          router.push("/dashboard/courier");
        } else if (data.user.role === "CUSTOMER") {
          router.push("/dashboard/customer");
        } else {
          router.push("/"); 
        }
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-dots-pattern flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full animate-fade-in-up">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-text3 hover:text-text1 transition-colors">
          <Activity className="w-5 h-5 text-accentWarm" />
          <span className="font-semibold tracking-tight text-xl">CaspianOS</span>
        </Link>
        
        <div className="card">
          <h1 className="text-2xl font-semibold mb-2">Create Account</h1>
          <p className="text-text3 text-sm mb-6 font-mono">Join the real-time logistics network.</p>
          
          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="flex gap-2 p-1 bg-surface2 rounded-lg border border-border2 mb-4">
               <button 
                 type="button" 
                 onClick={() => setRole("CUSTOMER")}
                 className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${role === 'CUSTOMER' ? 'bg-text1 text-bg' : 'text-text3 hover:text-text1'}`}>
                 Customer
               </button>
               <button 
                 type="button" 
                 onClick={() => setRole("COURIER")}
                 className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${role === 'COURIER' ? 'bg-text1 text-bg' : 'text-text3 hover:text-text1'}`}>
                 Courier
               </button>
               <button 
                 type="button" 
                 onClick={() => setRole("GOVERNMENT")}
                 className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${role === 'GOVERNMENT' ? 'bg-text1 text-bg' : 'text-text3 hover:text-text1'}`}>
                 Gov
               </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-text4">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text4" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface2 border border-border2 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-borderH1 transition-colors"
                  placeholder="Ivan Ivanov"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-text4">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text4" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface2 border border-border2 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-borderH1 transition-colors"
                  placeholder="+7 (XXX) XXX-XX-XX"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-text4">Password</label>
              <div className="relative">
                <Activity className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text4" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface2 border border-border2 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-borderH1 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {(role === "COURIER" || role === "CUSTOMER") && (
              <div className="space-y-2">
                <label className="text-xs font-mono text-text4">IIN (Tax ID)</label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text4" />
                  <input
                    type="text"
                    value={iin}
                    onChange={(e) => setIin(e.target.value)}
                    className="w-full bg-surface2 border border-border2 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-borderH1 transition-colors"
                    placeholder="123456789012"
                    required={role === "COURIER"}
                  />
                </div>
              </div>
            )}

            {role === "COURIER" && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-text4">Vehicle Brand & Model</label>
                  <div className="relative">
                    <Truck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text4" />
                    <input
                      type="text"
                      value={vehicleBrand}
                      onChange={(e) => setVehicleBrand(e.target.value)}
                      className="w-full bg-surface2 border border-border2 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-borderH1 transition-colors"
                      placeholder="Toyota Camry"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-text4">License Plate</label>
                  <div className="relative">
                    <Activity className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text4" />
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      className="w-full bg-surface2 border border-border2 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-borderH1 transition-colors"
                      placeholder="01 123 ABC"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn w-full justify-center mt-6 py-3">
              {loading ? "Creating Account..." : "Register"} <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            
            <div className="text-center mt-4">
               <Link href="/login" className="text-xs text-text4 hover:text-text2 underline underline-offset-4">
                 Already have an account? Login
               </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
