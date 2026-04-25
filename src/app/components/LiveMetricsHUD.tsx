"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AlertTriangle, Truck, CheckCircle } from "lucide-react";

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2 z-10 relative">
      <div className="bg-card/60 border border-border/50 border-b-4 border-b-rose-500 p-5 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center backdrop-blur-md flex flex-col items-center justify-center group">
        <div className="flex items-center gap-1.5 mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <h3 className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">Active Crises</h3>
        </div>
        <span className="text-4xl md:text-5xl font-extrabold text-foreground drop-shadow-sm">{metrics.active}</span>
      </div>
      
      <div className="bg-card/60 border border-border/50 border-b-4 border-b-amber-500 p-5 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center backdrop-blur-md flex flex-col items-center justify-center group">
        <div className="flex items-center gap-1.5 mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
          <Truck className="w-4 h-4 text-amber-500" />
          <h3 className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">Dispatched</h3>
        </div>
        <span className="text-4xl md:text-5xl font-extrabold text-foreground drop-shadow-sm">{metrics.dispatched}</span>
      </div>
      
      <div className="bg-card/60 border border-border/50 border-b-4 border-b-teal-500 p-5 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center backdrop-blur-md flex flex-col items-center justify-center group">
        <div className="flex items-center gap-1.5 mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
          <CheckCircle className="w-4 h-4 text-teal-500" />
          <h3 className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">Resolved</h3>
        </div>
        <span className="text-4xl md:text-5xl font-extrabold text-foreground drop-shadow-sm">{metrics.resolved}</span>
      </div>
    </div>
  );
}
