"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <p>Loading map…</p>,
});

export default function MapWrapper() {
  return <Map />;
}
