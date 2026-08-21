"use client";

import { Leaf, Fuel, Route, ArrowRight, Zap } from "lucide-react";

interface EcoStats {
  emptyKmBefore: number;
  emptyKmAfter: number;
  emptyKmSaved: number;
  fuelSavedL: number;
  fuelSavedKzt: number;
}

export default function CaspianEcoWidget({ stats }: { stats?: EcoStats }) {
  // Default mock data for demo if none provided
  const data = stats || {
    emptyKmBefore: 300,
    emptyKmAfter: 154,
    emptyKmSaved: 146,
    fuelSavedL: 43.8,
    fuelSavedKzt: 13140,
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl shadow-2xl">
      {/* Background gradients */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/20 blur-[80px]" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500/20 blur-[80px]" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Leaf size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">
              Caspian <span className="text-emerald-400">Eco-Routing</span>
            </h3>
            <p className="text-xs text-white/50 uppercase tracking-widest">
              Optimization Engine Active
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before / After Pipeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm font-medium text-white/60">Standard Route</span>
              <span className="text-sm font-bold text-red-400">{data.emptyKmBefore} km empty</span>
            </div>
            
            <div className="flex items-center justify-center text-white/20">
              <ArrowRight size={20} className="rotate-90 md:rotate-0" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm font-medium text-white/90">Optimized Corridor</span>
              <span className="text-sm font-bold text-emerald-400">{data.emptyKmAfter} km empty</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <Route className="text-blue-400 mb-2" size={24} />
              <span className="text-2xl font-black text-white">{data.emptyKmSaved}</span>
              <span className="text-[10px] uppercase tracking-wider text-white/50">KM Saved</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <Fuel className="text-orange-400 mb-2" size={24} />
              <span className="text-2xl font-black text-white">{data.fuelSavedL.toFixed(1)}</span>
              <span className="text-[10px] uppercase tracking-wider text-white/50">Liters Saved</span>
            </div>
          </div>
        </div>

        {/* Footer Financials */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <Zap size={14} className="text-yellow-400" />
            <span>Economic Impact per Trip</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-400">+{data.fuelSavedKzt.toLocaleString('ru-RU')}</span>
            <span className="text-sm text-emerald-400/60 font-bold">₸</span>
          </div>
        </div>
      </div>
    </div>
  );
}
