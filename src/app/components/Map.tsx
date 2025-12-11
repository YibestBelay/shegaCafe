"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
});

import { useEffect, useRef } from 'react';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const shopLocation = { lat: 9.680570, lng: 39.538044 };

  useEffect(() => {
    if (!mapInstance.current && mapContainer.current) {
      // @ts-ignore - Leaflet types are not perfect
      mapInstance.current = L.map(mapContainer.current).setView(
        [shopLocation.lat, shopLocation.lng],
        16
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      L.marker([shopLocation.lat, shopLocation.lng])
        .addTo(mapInstance.current)
        .bindPopup('Shega Cafe')
        .openPopup();
    }

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [shopLocation.lat, shopLocation.lng]);

  return (
    <div 
      ref={mapContainer} 
      // style={{ height: '400px', width: '100%' }}
      className="h-[500px] md:h-[400px] lg:h-[300px] w-full z-40"
    />
  );
}
