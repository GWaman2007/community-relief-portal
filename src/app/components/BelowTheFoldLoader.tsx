"use client";

import dynamic from "next/dynamic";

const BelowTheFold = dynamic(() => import("@/app/components/BelowTheFold"), {
  ssr: false,
  loading: () => (
    <div className="w-full flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 rounded-full bg-primary/20 animate-ping mb-4"></div>
      <p className="text-muted-foreground text-xs font-medium animate-pulse tracking-widest uppercase">Loading content...</p>
    </div>
  )
});

export default function BelowTheFoldLoader() {
  return <BelowTheFold />;
}
