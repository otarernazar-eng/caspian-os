"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Phone, Activity } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
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
          <h1 className="text-2xl font-semibold mb-2">Login</h1>
          <p className="text-text3 text-sm mb-6 font-mono">Access your account.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
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
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text4" />
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

            <button type="submit" disabled={loading} className="btn w-full justify-center mt-6 py-3">
              {loading ? "Authenticating..." : "Sign In"} <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            
            <div className="text-center mt-4">
               <Link href="/register" className="text-xs text-text4 hover:text-text2 underline underline-offset-4">
                 Don't have an account? Register here
               </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
