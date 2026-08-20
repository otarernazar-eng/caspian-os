"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(m => m.Polyline), { ssr: false });

const parseWKT = (wkt: string) => {
  if (!wkt || !wkt.startsWith("LINESTRING")) return [];
  const coordsStr = wkt.replace("LINESTRING(", "").replace(")", "");
  return coordsStr.split(",").map(pair => {
    const [lng, lat] = pair.trim().split(" ");
    return [parseFloat(lat), parseFloat(lng)];
  });
};

export default function LogisticsMap({ orders }: { orders: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [LeafletInst, setLeafletInst] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    import("leaflet").then((L) => {
      setLeafletInst(L);
    });
  }, []);

  if (!mounted || !LeafletInst) return <div className="h-full w-full bg-surface2 animate-pulse rounded-lg flex items-center justify-center text-text4 font-mono text-sm">Initializing Map...</div>;

  const destIcon = new LeafletInst.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149059.png',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });

  const courierIcon = new LeafletInst.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <MapContainer center={[43.6481, 51.1983]} zoom={6} className="h-full w-full rounded-lg z-0" zoomControl={false}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />
      
      {orders.map(o => (
        <div key={o.id}>
          {o.destLat && o.destLng && (
             <Marker position={[o.destLat, o.destLng]} icon={destIcon}>
               <Popup className="custom-popup">
                 <div className="p-2">
                   <div className="font-semibold text-sm mb-1">{o.description}</div>
                   <div className="text-xs">Status: <span className="text-accentWarm">{o.status}</span></div>
                 </div>
               </Popup>
             </Marker>
          )}

           {o.courier?.courierProfile?.lastLat && o.courier?.courierProfile?.lastLng && (
             <Marker position={[o.courier.courierProfile.lastLat, o.courier.courierProfile.lastLng]} icon={courierIcon}>
               <Popup className="custom-popup">
                 <div className="p-2">
                   <div className="font-semibold text-sm mb-1">Courier: {o.courier.name}</div>
                   <div className="text-xs">{o.courier.courierProfile.vehicleBrand}</div>
                 </div>
               </Popup>
             </Marker>
          )}

          {o.routeGeometry && (
             <Polyline 
               positions={parseWKT(o.routeGeometry)} 
               pathOptions={{ color: '#ef4444', weight: 4, opacity: 0.8 }} 
             />
          )}
        </div>
      ))}
    </MapContainer>
  );
}
