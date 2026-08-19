"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Navigation, AlertCircle, Thermometer, MapPin, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DriverDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tripStarted, setTripStarted] = useState(false);
  const [tempAlert, setTempAlert] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard/driver")
      .then(res => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then(d => {
        if (d) {
          setData(d);
          setLoading(false);
          // Simulate temp alert after starting
        }
      });
  }, [router]);

  useEffect(() => {
    if (tripStarted) {
      const timer = setTimeout(() => {
        setTempAlert(true);
      }, 5000); // 5 seconds after starting trip, trigger a temperature alert for the demo
      return () => clearTimeout(timer);
    }
  }, [tripStarted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2 font-mono text-text4 text-sm">
          <Activity className="w-4 h-4 animate-spin" />
          Loading Manifest...
        </div>
      </div>
    );
  }

  const shipment = data.shipments[0]; // Active shipment

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur border-b border-border1 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-accentWarm" />
          <span className="font-semibold tracking-tight">Driver Copilot</span>
        </div>
        <button onClick={() => {
            fetch("/api/auth/logout", { method: "POST" }).then(() => router.push("/"));
        }} className="text-xs font-mono text-text4 hover:text-text2">
          LOGOUT
        </button>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6 pb-20">
        
        {!tripStarted ? (
          <div className="animate-fade-in-up space-y-6">
            <div className="text-center pt-4">
              <div className="inline-block px-3 py-1 rounded-full bg-surface2 border border-border2 text-xs font-mono text-text3 mb-4">
                PRE-TRIP CHECK
              </div>
              <h1 className="text-2xl font-bold mb-2">Shipment {shipment?.trackingId || 'KZ-19281'}</h1>
              <p className="text-text4 text-sm">{shipment?.origin} &rarr; {shipment?.destination}</p>
            </div>

            <div className="card space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Temperature System</div>
                  <div className="text-xs text-text4">Target: +4°C, Current: +3.8°C</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Documentation</div>
                  <div className="text-xs text-text4">3/3 verified via Gov Gateway</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Route AI Analysis</div>
                  <div className="text-xs text-text4">Clear weather, minor congestion at port</div>
                </div>
              </div>
            </div>

            <button onClick={() => setTripStarted(true)} className="btn w-full py-4 justify-center bg-text1 text-bg hover:bg-text2 hover:text-bg font-semibold text-base border-none">
              <Play className="w-5 h-5 mr-2" /> Start Authorized Trip
            </button>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
            
            <div className="card bg-surface2 border-border2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Navigation className="w-4 h-4 text-[#7CF8E5]" /> IN TRANSIT
                </div>
                <div className="text-right">
                  <div className="text-xs text-text4 font-mono">ETA</div>
                  <div className="text-lg font-bold text-accentWarm">
                    {new Date(shipment?.eta || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div className="h-2 bg-bg rounded-full overflow-hidden">
                <div className="h-full bg-accentWarm w-1/3 rounded-full"></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-text4">
                <span>{shipment?.origin}</span>
                <span>{shipment?.destination}</span>
              </div>
            </div>

            {tempAlert && (
              <div className="card border-red-500/50 bg-red-950/20 animate-fade-in-up">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                  <div>
                    <h3 className="text-red-500 font-semibold mb-1">TEMPERATURE DEVIATION</h3>
                    <div className="space-y-1 mb-3 text-sm">
                      <div className="flex justify-between text-text2">
                        <span>Current:</span>
                        <span className="text-red-400 font-bold">+7.1°C</span>
                      </div>
                      <div className="flex justify-between text-text4">
                        <span>Recommended:</span>
                        <span>+4.0°C</span>
                      </div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded p-2 text-xs text-red-300">
                      <strong>AI Action:</strong> Check refrigeration unit compressor immediately.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="card p-4">
                <div className="text-xs font-mono text-text4 mb-2 flex items-center gap-1"><Thermometer className="w-3 h-3"/> CARGO</div>
                <div className={`text-xl font-bold ${tempAlert ? 'text-red-400' : 'text-[#7CF8E5]'}`}>
                  {tempAlert ? '+7.1°C' : '+3.8°C'}
                </div>
              </div>
              <div className="card p-4">
                <div className="text-xs font-mono text-text4 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3"/> NEXT STOP</div>
                <div className="text-lg font-medium truncate">Beyneu Checkpoint</div>
              </div>
            </div>

            <button className="btn w-full justify-center py-4 bg-transparent border-border2 hover:border-borderH1">
               Report Incident
            </button>

          </div>
        )}

      </main>
    </div>
  );
}
