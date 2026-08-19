"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Activity } from "lucide-react";
import Link from "next/link";

const DEMO_ACCOUNTS = [
  { email: "gov@caspian.os", role: "GOVERNMENT", desc: "Strategic operations" },
  { email: "driver@caspian.os", role: "DRIVER", desc: "Logistics execution" },
  { email: "logistics@caspian.os", role: "LOGISTICS_OPERATOR", desc: "Fleet management" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user.role === "GOVERNMENT" || data.user.role === "ADMIN") {
          router.push("/dashboard/gov");
        } else if (data.user.role === "DRIVER") {
          router.push("/dashboard/driver");
        } else {
          router.push("/dashboard/gov"); // Default fallback
        }
      } else {
        alert(data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-dots-pattern flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in-up">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-text3 hover:text-text1 transition-colors">
          <Activity className="w-5 h-5 text-accentWarm" />
          <span className="font-semibold tracking-tight text-xl">CaspianOS</span>
        </Link>
        
        <div className="card">
          <h1 className="text-2xl font-semibold mb-2">Access Operations Center</h1>
          <p className="text-text3 text-sm mb-6 font-mono">Authentication required.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-text4">Operator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface2 border border-border2 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-borderH1 transition-colors"
                  placeholder="operator@caspian.os"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-text4">Passcode</label>
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

            <button type="submit" disabled={loading} className="btn w-full justify-center mt-6">
              {loading ? "Authenticating..." : "Initialize Session"} <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border1">
            <p className="text-xs font-mono text-text4 mb-4 uppercase tracking-wider">Demo Accounts</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => setEmail(acc.email)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-surface2 transition-colors border border-transparent hover:border-border2 flex flex-col"
                >
                  <span className="text-sm font-medium">{acc.role}</span>
                  <span className="text-xs text-text4 font-mono">{acc.email} — {acc.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
