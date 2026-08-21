"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, Scan, Camera, XCircle, Truck, Car, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AIScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Prefer back camera on phones
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera access denied or unavailable", err);
      setError("Не удалось получить доступ к камере. Проверьте разрешения в браузере.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Draw current video frame to canvas
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.7);

    setIsScanning(true);
    setResult(null);

    try {
      const res = await fetch("/api/parse/vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 })
      });
      
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setError("Ошибка сервера при анализе");
      }
    } catch (e) {
      setError("Сетевая ошибка при анализе");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text1 flex flex-col items-center">
      <header className="w-full bg-surface1 border-b border-border1 p-4 flex justify-between items-center z-10">
        <Link href="/" className="font-bold flex items-center gap-2 hover:text-[#7CF8E5]">
          <Activity className="w-5 h-5 text-[#7CF8E5]" />
          <span>Caspian AI Inspector</span>
        </Link>
        <div className="text-xs text-text4 flex items-center gap-1">
          <Scan className="w-4 h-4" /> LIVE VISION
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg flex flex-col p-4">
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-red-500/10 rounded-xl border border-red-500/30">
            <XCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-red-300 font-semibold mb-2">{error}</p>
            <button onClick={startCamera} className="btn bg-surface2 mt-4">Попробовать снова</button>
          </div>
        ) : (
          <div className="relative w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden border-2 border-border2 shadow-2xl flex flex-col">
            {/* Live Video Feed */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Hidden Canvas for capturing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanner Overlay HUD */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
              <div className="flex justify-between w-full">
                <div className="w-8 h-8 border-t-2 border-l-2 border-[#7CF8E5]"></div>
                <div className="w-8 h-8 border-t-2 border-r-2 border-[#7CF8E5]"></div>
              </div>
              
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="flex flex-col items-center animate-pulse">
                    <Scan className="w-12 h-12 text-[#7CF8E5] animate-spin-slow mb-2" />
                    <span className="text-[#7CF8E5] font-mono font-bold tracking-widest text-sm">ANALYZING...</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between w-full">
                <div className="w-8 h-8 border-b-2 border-l-2 border-[#7CF8E5]"></div>
                <div className="w-8 h-8 border-b-2 border-r-2 border-[#7CF8E5]"></div>
              </div>
            </div>

            {/* Results Overlay */}
            {result && !isScanning && (
              <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-md p-6 border-t border-border1 animate-fade-in-up">
                {result.detected ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-green-400 font-bold mb-1">
                      <CheckCircle2 className="w-5 h-5" /> Транспорт обнаружен
                    </div>
                    <div className="flex items-center gap-3 text-lg font-semibold">
                      {result.type.includes("Грузовик") || result.type.includes("Тягач") ? (
                        <Truck className="w-6 h-6 text-accentWarm" />
                      ) : (
                        <Car className="w-6 h-6 text-accentWarm" />
                      )}
                      <span>{result.type}</span>
                    </div>
                    <div className="text-sm text-text3 flex justify-between border-t border-border2 pt-2 mt-2">
                      <span>Грузоподъемность:</span>
                      <span className="font-mono text-white">{result.capacity}</span>
                    </div>
                    <div className="text-xs text-text4 font-mono mt-2 opacity-50">Raw AI: {result.raw}</div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                      <XCircle className="w-5 h-5" /> {result.type}
                    </div>
                    <p className="text-sm text-text3">Направьте камеру на автомобиль.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Shutter Button */}
        <div className="mt-8 flex justify-center pb-8">
          <button 
            onClick={captureAndAnalyze}
            disabled={isScanning || !!error}
            className="relative flex items-center justify-center w-20 h-20 bg-surface1 border-4 border-border2 rounded-full hover:border-[#7CF8E5] transition-all group disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="w-14 h-14 bg-white rounded-full group-hover:scale-95 transition-transform flex items-center justify-center shadow-[0_0_20px_rgba(124,248,229,0.3)] group-hover:shadow-[0_0_30px_rgba(124,248,229,0.5)]">
              <Camera className="w-6 h-6 text-black" />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
