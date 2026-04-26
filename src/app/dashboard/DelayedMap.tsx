"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./MapComponent"), { 
  ssr: false,
  loading: () => <MapFallback />
});

function MapFallback() {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-card/40 backdrop-blur-sm rounded-xl">
      <div className="w-12 h-12 rounded-full bg-primary/20 animate-ping mb-4"></div>
      <p className="text-muted-foreground text-xs font-medium animate-pulse tracking-widest uppercase">Connecting to Geospatial Network...</p>
    </div>
  );
}

export default function DelayedMap({ filterCategory = "All" }: { filterCategory?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) return <MapFallback />;

  return <MapComponent filterCategory={filterCategory} />;
}
