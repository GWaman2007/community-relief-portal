"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import LiveMetricsHUD from "@/app/components/LiveMetricsHUD";

const MapComponent = dynamic(() => import("@/app/dashboard/MapComponent"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center selection:bg-emerald-500 selection:text-white relative">
      
      {/* RBAC Authentication Navigation */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition">Login</Link>
        <Link href="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-semibold transition shadow hover:shadow-emerald-500/20">Register</Link>
      </div>

      <div className="max-w-4xl w-full mt-10">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text pb-2">
          Community Relief Portal
        </h1>
        <p className="text-slate-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Our disaster response architecture leverages real-time AI modeling to deduplicate field reports and securely triangulate skilled community volunteers via strict multi-tenant authorization protocols.
        </p>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><span className="text-emerald-500">📡</span> Live Crisis Map Array</h2>
            <span className="text-xs font-mono bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full border border-rose-500/30">Read-Only Uplink</span>
          </div>
          
          <LiveMetricsHUD />
          
          {/* Read Only Heatmap proxy lacks auth payload hiding active Dispatch logic naturally */}
          <div className="opacity-[0.85] rounded-xl overflow-hidden">
            <MapComponent filterNode="All" />
          </div>
        </div>
      </div>
    </div>
  );
}
