"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LiveMetricsHUD() {
  const [metrics, setMetrics] = useState({ active: 0, dispatched: 0, resolved: 0 });

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.from("reports").select("status");
      if (data) {
        setMetrics({
          active: data.filter(d => !d.status || d.status === 'critical').length,
          dispatched: data.filter(d => d.status === 'dispatched').length,
          resolved: data.filter(d => d.status === 'resolved').length,
        });
      }
    }
    fetchStats();
    
    // Subscribe to any row mutation to hot-reload strictly the math metrics
    const sub = supabase.channel('hud-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports'}, fetchStats)
      .subscribe();
      
    return () => { supabase.removeChannel(sub); };
  }, []);

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 z-10 relative">
      <div className="bg-background/50 border border-border/50 border-b-4 border-b-rose-500 p-4 rounded-xl shadow-lg text-center backdrop-blur-sm">
        <h3 className="text-rose-500 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Active Crises</h3>
        <span className="text-3xl md:text-5xl font-black text-rose-100">{metrics.active}</span>
      </div>
      <div className="bg-background/50 border border-border/50 border-b-4 border-b-amber-500 p-4 rounded-xl shadow-lg text-center backdrop-blur-sm">
        <h3 className="text-amber-500 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Dispatched</h3>
        <span className="text-3xl md:text-5xl font-black text-amber-100">{metrics.dispatched}</span>
      </div>
      <div className="bg-background/50 border border-border/50 border-b-4 border-b-emerald-500 p-4 rounded-xl shadow-lg text-center backdrop-blur-sm">
        <h3 className="text-emerald-500 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Resolved</h3>
        <span className="text-3xl md:text-5xl font-black text-emerald-100">{metrics.resolved}</span>
      </div>
    </div>
  );
}
