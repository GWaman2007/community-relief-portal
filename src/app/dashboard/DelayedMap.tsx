"use client";

import { useState, useEffect, useRef } from "react";
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
  const [inView, setInView] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // Only need to trigger once
        }
      },
      { rootMargin: "200px" } // Start loading 200px before it enters viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sentinelRef} className="w-full h-full">
      {inView ? <MapComponent filterCategory={filterCategory} /> : <MapFallback />}
    </div>
  );
}
