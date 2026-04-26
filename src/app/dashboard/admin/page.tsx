"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import LiveMetricsHUD from "@/app/components/LiveMetricsHUD";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MapComponent = dynamic(() => import("@/app/dashboard/MapComponent"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-card/40 rounded-xl">
      <div className="w-12 h-12 rounded-full bg-primary/20 animate-ping mb-4"></div>
      <p className="text-muted-foreground text-sm font-medium animate-pulse tracking-widest uppercase">Initializing Map...</p>
    </div>
  )
});

const SEMANTIC_NODES = [
  "All",
  "Public Health",
  "Water & Sanitation",
  "Infrastructure",
  "Food Security",
  "Education",
  "Emergency Relief"
];

export default function AdminDashboard() {
  const router = useRouter();
  const [ngos, setNgos] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [filterNode, setFilterNode] = useState("All");

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
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col items-center relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-rose-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-7xl flex flex-col gap-6 z-10">
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-2xl p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-rose-500 tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" /> DISASTER RELIEF COMMAND CENTER
              </h1>
              <p className="text-muted-foreground font-mono text-sm mt-1">Global Administrator Access</p>
            </div>
          </div>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="bg-background/50 border-border/50 font-bold transition">Logout</Button>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2 bg-card/60 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden flex flex-col">
            <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-border/50 bg-background/50">
              <CardTitle className="text-primary">Live Global Heatmap</CardTitle>
              <select 
                value={filterNode} 
                onChange={(e) => setFilterNode(e.target.value)}
                className="bg-background text-foreground border border-border/50 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {SEMANTIC_NODES.map(node => (
                  <option key={node} value={node}>{node === "All" ? "🌍 Global Feed" : node}</option>
                ))}
              </select>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="p-4 border-b border-border/40 bg-background/30">
                <LiveMetricsHUD />
              </div>
              <div className="flex-1 relative min-h-[500px]">
                <MapComponent filterNode={filterNode} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-96 overflow-y-auto">
              <CardHeader className="pb-4 sticky top-0 bg-card/80 backdrop-blur-md z-10 border-b border-border/50">
                <CardTitle className="text-primary">NGO Trust Architecture</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <table className="w-full text-left border-collapse table-fixed">
                  <colgroup>
                    <col className="w-5/12" />
                    <col className="w-4/12" />
                    <col className="w-3/12" />
                  </colgroup>
                  <tbody>
                    {ngos.length === 0 ? (
                      <tr><td colSpan={3} className="p-3 text-muted-foreground italic text-center text-sm">No NGOs registered.</td></tr>
                    ) : (
                      ngos.map((ngo: any) => (
                        <tr key={ngo.id} className="border-t border-border/50">
                          <td className="p-3 overflow-hidden">
                            <span className={`font-medium text-sm whitespace-nowrap block text-ellipsis overflow-hidden ${ngo.is_authorized ? 'text-primary' : 'text-foreground'}`}>{ngo.name}</span>
                            <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 mt-1 inline-block rounded ${ngo.is_authorized ? 'bg-primary/10 text-primary' : 'bg-muted border border-border text-muted-foreground'}`}>{ngo.is_authorized ? "Trusted System" : "Pending Validation"}</span>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs text-ellipsis overflow-hidden whitespace-nowrap">{ngo.email}</td>
                          <td className="p-3 align-middle text-right">
                            {ngo.is_authorized ? (
                              <button 
                                onClick={async () => {
                                  const { data: { session } } = await supabase.auth.getSession();
                                  await fetch("/api/admin/ngo/suspend", {
                                     method: "POST", 
                                     headers: { "Content-Type" : "application/json", "Authorization": `Bearer ${session?.access_token}` }, 
                                     body: JSON.stringify({ ngo_id: ngo.id }) 
                                  });
                                  setNgos(prev => prev.map(n => n.id === ngo.id ? { ...n, is_authorized: false } : n));
                                }}
                                className="w-full max-w-[100px] bg-destructive/10 hover:bg-destructive border border-destructive/20 text-destructive hover:text-destructive-foreground px-2 py-1.5 rounded text-[10px] uppercase font-black tracking-widest transition-all"
                              >
                                Revoke
                              </button>
                            ) : (
                              <button 
                                onClick={() => toggleAuth("ngos", ngo.id, ngo.is_authorized)}
                                className="w-full max-w-[100px] bg-primary/10 hover:bg-primary border border-primary/20 text-primary hover:text-primary-foreground px-2 py-1.5 rounded text-[10px] uppercase font-black tracking-widest transition-all shadow-sm"
                              >
                                Authorize
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-96 overflow-y-auto">
              <CardHeader className="pb-4 sticky top-0 bg-card/80 backdrop-blur-md z-10 border-b border-border/50">
                <CardTitle className="text-primary">AI Volunteer Verification</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {volunteers.map(v => (
                  <div key={v.id} className="bg-background/50 border border-border/50 p-3 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                      <h3 className="font-semibold text-sm flex items-center gap-1">{v.name}</h3>
                      {v.rejection_reason && <p className="text-xs text-destructive leading-tight my-1">AI Output: {v.rejection_reason}</p>}
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 mt-1 inline-block rounded ${v.is_authorized ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>{v.is_authorized ? "Verified" : "Flagged"}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleAuth("volunteers", v.id, v.is_authorized)} 
                      className={`text-xs font-bold border-border/50 ${v.is_authorized ? 'hover:bg-destructive/10 text-destructive' : 'hover:bg-primary/10 text-primary'}`}
                    >
                      {v.is_authorized ? "Ban" : "Approve"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
