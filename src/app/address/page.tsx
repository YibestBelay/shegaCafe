"use client";

import MapWrapper from "../components/MapWrapper";

export default function ShopPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 ">Our Location</h1>

      <p className="mb-4">
        📍 <b>Shega Cafe</b><br />
        Debre Birhan, Ethiopia
      </p>
      <MapWrapper />
    </div>
  );
}
