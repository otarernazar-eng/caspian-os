"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then(m => m.CircleMarker), { ssr: false });

export default function LogisticsMap({ shipments, bottlenecks }: { shipments: any[], bottlenecks: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [LeafletInst, setLeafletInst] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Dynamically load leaflet to create custom icons
    import("leaflet").then((L) => {
      setLeafletInst(L);
    });
  }, []);

  if (!mounted || !LeafletInst) return <div className="h-full w-full bg-surface2 animate-pulse rounded-lg flex items-center justify-center text-text4 font-mono text-sm">Initializing Satellite Feed...</div>;

  const truckIcon = new LeafletInst.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <MapContainer center={[43.6481, 51.1983]} zoom={6} className="h-full w-full rounded-lg z-0" zoomControl={false}>
      {/* Dark theme map tiles */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {shipments.filter(s => s.currentLat && s.currentLng).map(s => (
        <Marker key={s.id} position={[s.currentLat, s.currentLng]} icon={truckIcon}>
          <Popup className="custom-popup">
            <div className="p-2">
              <div className="text-xs font-mono text-text4 mb-1">ID: {s.trackingId}</div>
              <div className="font-semibold text-sm mb-1">{s.origin} &rarr; {s.destination}</div>
              <div className="text-xs">Status: <span className="text-accentWarm">{s.status}</span></div>
            </div>
          </Popup>
        </Marker>
      ))}

      {bottlenecks.map(b => (
        <CircleMarker 
          key={b.id} 
          center={[b.lat, b.lng]} 
          radius={b.severity === 'RED' ? 16 : 10}
          pathOptions={{ 
            color: b.severity === 'RED' ? '#ef4444' : '#eab308',
            fillColor: b.severity === 'RED' ? '#ef4444' : '#eab308',
            fillOpacity: 0.4 
          }}
        >
          <Popup>
            <div className="p-2">
              <div className="text-xs font-mono text-text4 mb-1 uppercase tracking-wider">{b.severity} ALERT</div>
              <div className="font-semibold text-sm mb-1">{b.location}</div>
              <div className="text-xs mb-1">Delay: {b.averageDelay}h</div>
              <div className="text-xs text-red-400">Impact: ₸{(b.economicImpact / 1000000).toFixed(1)}M</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
