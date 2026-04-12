"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import LiveMetricsHUD from "@/app/components/LiveMetricsHUD";

const MapComponent = dynamic(() => import("@/app/dashboard/MapComponent"), { ssr: false });

export default function AdminDashboard() {
  const router = useRouter();
  const [ngos, setNgos] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);

  useEffect(() => {
    let volChannel: any;
    let ngoChannel: any;
    
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        alert("Platform Admin Access Required.");
        setTimeout(() => router.push("/login"), 100);
        return;
      }
      fetchData();
      
      volChannel = supabase.channel(`admin-vol-${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'volunteers' }, fetchData)
        .subscribe();
        
      ngoChannel = supabase.channel(`admin-ngo-${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ngos' }, fetchData)
        .subscribe();
    }
    
    checkAuth();
    
    return () => {
      if (volChannel) supabase.removeChannel(volChannel);
      if (ngoChannel) supabase.removeChannel(ngoChannel);
    };
  }, [router]);

  async function fetchData() {
    const { data: ngoData } = await supabase.from("ngos").select("*").order("created_at", { ascending: false });
    if (ngoData) setNgos(ngoData);

    const { data: volData } = await supabase.from("volunteers").select("*").order("created_at", { ascending: false });
    if (volData) setVolunteers(volData);
  }

  const toggleAuth = async (table: string, id: string, currentState: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const originStr = window.location.origin;
    await fetch(`${originStr}/api/admin/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
      body: JSON.stringify({ table, id, state: !currentState })
    });
    fetchData(); // Refresh UI silently
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <div className="flex justify-between items-center bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-rose-500 tracking-tight flex items-center gap-2">🛡️ CENTRAL COMMAND PLATFORM</h1>
            <p className="text-slate-400 font-mono text-sm mt-1">Super Admin Controls Unlocked</p>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded font-bold transition">Logout</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-4">
            <h2 className="font-bold text-lg mb-4 text-emerald-400">Live Global Heatmap</h2>
            <LiveMetricsHUD />
            <MapComponent filterNode="All" />
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-6 h-96 overflow-y-auto">
              <h2 className="font-bold text-lg mb-4 text-cyan-400">NGO Trust Architecture</h2>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {ngos.length === 0 ? (
                    <tr><td colSpan={3} className="p-3 text-slate-500 italic text-center text-sm">No NGOs registered.</td></tr>
                  ) : (
                    ngos.map((ngo: any) => (
                      <tr key={ngo.id} className="border-t border-slate-700/50">
                        <td className="p-3">
                          <span className={`font-medium text-sm whitespace-nowrap block ${ngo.is_authorized ? 'text-emerald-400' : 'text-slate-300'}`}>{ngo.name}</span>
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 mt-1 inline-block rounded ${ngo.is_authorized ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{ngo.is_authorized ? "Trusted System" : "Pending Validation"}</span>
                        </td>
                        <td className="p-3 text-slate-400 text-xs text-ellipsis overflow-hidden">{ngo.email}</td>
                        <td className="p-3 align-middle">
                          {ngo.is_authorized ? (
                            <button 
                              onClick={async () => {
                                const { data: { session } } = await supabase.auth.getSession();
                                await fetch("/api/admin/ngo/suspend", {
                                   method: "POST", 
                                   headers: { "Content-Type" : "application/json", "Authorization": `Bearer ${session?.access_token}` }, 
                                   body: JSON.stringify({ ngo_id: ngo.id }) 
                                });
                                // Optimistically update the primary ngos array modifying the boolean flag
                                setNgos(prev => prev.map(n => n.id === ngo.id ? { ...n, is_authorized: false } : n));
                              }}
                              className="w-full bg-rose-900/30 hover:bg-rose-900 border border-rose-500/50 text-rose-500 hover:text-white px-3 py-1.5 rounded text-[10px] uppercase font-black tracking-widest transition-all"
                            >
                              Revoke
                            </button>
                          ) : (
                            <button 
                              onClick={() => toggleAuth("ngos", ngo.id, ngo.is_authorized)}
                              className="w-full bg-cyan-900/40 hover:bg-cyan-800 border border-cyan-500/50 text-cyan-400 hover:text-white px-3 py-1.5 rounded text-[10px] uppercase font-black tracking-widest transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                            >
                              Authorize Setup
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-6 h-96 overflow-y-auto">
              <h2 className="font-bold text-lg mb-4 text-blue-400">AI Volunteer Gatekeeper</h2>
              {volunteers.map(v => (
                <div key={v.id} className="bg-slate-900 border border-slate-700 p-3 rounded mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-1">{v.name}</h3>
                    {v.rejection_reason && <p className="text-xs text-rose-400 leading-tight my-1">AI Output: {v.rejection_reason}</p>}
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 mt-1 inline-block rounded ${v.is_authorized ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{v.is_authorized ? "Cleaned" : "Flagged"}</span>
                  </div>
                  <button onClick={() => toggleAuth("volunteers", v.id, v.is_authorized)} className="bg-slate-700 hover:bg-slate-600 px-3 py-1 text-xs font-bold rounded">{v.is_authorized ? "Ban" : "Approve"}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
