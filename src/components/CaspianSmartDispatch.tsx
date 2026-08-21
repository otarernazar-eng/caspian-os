"use client";

import { useState } from "react";
import { Sparkles, MapPin, Package, Weight, ArrowRight, Loader2 } from "lucide-react";

export default function CaspianSmartDispatch() {
  const [text, setText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleParse = async () => {
    if (!text) return;
    setIsParsing(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const data = await res.json();
        setParsedData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Sparkles size={120} />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">
              Smart <span className="text-blue-400">Dispatch</span>
            </h3>
            <p className="text-xs text-white/50 uppercase tracking-widest">
              AI-Powered Order Ingestion
            </p>
          </div>
        </div>

        <div className="relative mb-4">
          <textarea
            className="w-full h-28 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none text-sm"
            placeholder="Введите текст сообщения из WhatsApp или Telegram... (напр. 'Нужно завтра из Актау в Шетпе отвезти 5 тонн кирпича')"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            onClick={handleParse}
            disabled={isParsing || !text}
            className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isParsing ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          </button>
        </div>

        {parsedData && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-xs text-white/40 mb-2 font-medium tracking-wider uppercase">
              Parsed Intelligence
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3">
                <MapPin size={16} className="text-rose-400" />
                <div>
                  <div className="text-[10px] text-white/40 uppercase">Origin</div>
                  <div className="text-sm font-semibold text-white">{parsedData.origin}</div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3">
                <MapPin size={16} className="text-emerald-400" />
                <div>
                  <div className="text-[10px] text-white/40 uppercase">Destination</div>
                  <div className="text-sm font-semibold text-white">{parsedData.destination}</div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3">
                <Package size={16} className="text-purple-400" />
                <div>
                  <div className="text-[10px] text-white/40 uppercase">Cargo</div>
                  <div className="text-sm font-semibold text-white">{parsedData.cargo}</div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3">
                <Weight size={16} className="text-amber-400" />
                <div>
                  <div className="text-[10px] text-white/40 uppercase">Weight</div>
                  <div className="text-sm font-semibold text-white">{parsedData.weight} kg</div>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium py-2 rounded-xl transition-all text-sm">
              Confirm & Create Route
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
