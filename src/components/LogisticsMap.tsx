"use client";

import { useEffect, useRef, useState } from "react";
import { load } from "@2gis/mapgl";

const parseWKT = (wkt: string): number[][] => {
  if (!wkt || !wkt.startsWith("LINESTRING")) return [];
  const coordsStr = wkt.replace("LINESTRING(", "").replace(")", "");
  return coordsStr.split(",").map(pair => {
    const [lng, lat] = pair.trim().split(" ");
    return [parseFloat(lng), parseFloat(lat)]; // MapGL expects [lng, lat]
  });
};

export default function LogisticsMap({ orders }: { orders: any[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    let map: any;

    if (!mapContainer.current) return;

    load().then((mapglAPI) => {
      map = new mapglAPI.Map(mapContainer.current!, {
        center: [51.1983, 43.6481], // [lng, lat] (Aktau region as default)
        zoom: 6,
        key: process.env.TWOGIS_API_KEY || "09ce5faf-9ec3-47c1-8329-9560c544c79f", // Same key for map & routing
        // Dark theme map style UUID for 2GIS
        style: "c080bb6a-8134-4993-93a1-5b4d8c36a59b",
      });

      setMapInstance(map);

      // Draw markers and routes
      orders.forEach((o) => {
        // Destination Marker
        if (o.destLat && o.destLng) {
          new mapglAPI.Marker(map, {
            coordinates: [o.destLng, o.destLat],
            label: {
              text: o.description,
              color: '#ffffff',
              haloColor: '#1e1e1e',
              haloRadius: 1,
            }
          });
        }

        // Courier Marker
        if (o.courier?.courierProfile?.lastLat && o.courier?.courierProfile?.lastLng) {
          new mapglAPI.Marker(map, {
            coordinates: [o.courier.courierProfile.lastLng, o.courier.courierProfile.lastLat],
            label: {
              text: o.courier.name,
              color: '#eab308',
              haloColor: '#1e1e1e',
            }
          });
        }

        // Route Polyline
        if (o.routeGeometry) {
          const coords = parseWKT(o.routeGeometry);
          if (coords.length > 0) {
            new mapglAPI.Polyline(map, {
              coordinates: coords,
              width: 4,
              color: '#ef4444',
            });
            // Optionally fit map to route
            const lats = coords.map(c => c[1]);
            const lngs = coords.map(c => c[0]);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);
            
            // Adjust bounds if we only have one active order
            if (orders.length === 1) {
              map.setBounds([
                [minLng - 0.05, minLat - 0.05], // SouthWest
                [maxLng + 0.05, maxLat + 0.05]  // NorthEast
              ]);
            }
          }
        }
      });
    });

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, [orders]);

  return (
    <div style={{ width: "100%", height: "100%" }} className="relative bg-surface1">
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
