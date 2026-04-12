"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function VolunteerInbox() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [volunteerRecord, setVolunteerRecord] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") Notification.requestPermission();
    }

    async function verifyAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return setTimeout(() => router.push("/login"), 100);

      if (session.user.user_metadata?.role !== 'volunteer') {
        alert("Access Denied: This area is reserved for field volunteers only.");
        return setTimeout(() => router.push("/dashboard"), 100);
      }

      const uid = session.user.id;
      const { data: volData } = await supabase.from("volunteers").select("*").eq("auth_id", uid).single();
      
      if (!volData) {
        alert("You do not have a volunteer profile linked to this account.");
        return setTimeout(() => router.push("/register"), 100);
      }

      setVolunteerRecord(volData);

      const { data: notifData } = await supabase
        .from("notifications")
        .select("*, reports(*)")
        .eq("volunteer_id", volData.id)
        .order("created_at", { ascending: false });
        
      if (notifData) {
        setNotifications(notifData.filter(n => n.reports?.status !== 'resolved'));
      }
      setLoading(false);

      const channelName = `notifs-${Date.now()}`;
      const sub = supabase.channel(channelName)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `volunteer_id=eq.${volData.id}` }, (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Urgent NGO Dispatch", { body: payload.new.message, icon: "/favicon.ico" });
          }
        })
        .subscribe();
        
      const resChannel = supabase.channel(`resolution-${Date.now()}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reports' }, (payload) => {
          if (payload.new.status === 'resolved') {
            setNotifications(prev => prev.filter(n => n.report_id !== payload.new.id));
          }
        })
        .subscribe();

      return () => { 
        supabase.removeChannel(sub); 
        supabase.removeChannel(resChannel);
      };
    }

    verifyAuth();
  }, [router]);

  const handleResponse = async (id: string, action: string) => {
    // Optimistic UI Update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: action } : n));
    
    const { data: { session } } = await supabase.auth.getSession();
    
    // Sync to DB
    await fetch("/api/volunteer/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
      body: JSON.stringify({ notification_id: id, action })
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading inbox...</div>;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-4 md:p-8">
      <div className="max-w-3xl w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3"><span className="text-emerald-500">📥</span> Secure Field Inbox</h1>
            <p className="text-emerald-400 mt-1 text-sm font-mono tracking-widest uppercase">Operative {volunteerRecord.name}</p>
          </div>
          <button onClick={handleLogout} className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded transition border border-slate-700">
            Logout
          </button>
        </div>

        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden flex flex-col h-[75vh]">
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <p className="font-medium text-lg">No dispatch notifications yet.</p>
                <p className="text-sm">We will notify you when volunteers are needed nearby.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`border p-5 rounded-lg shadow-sm transition-all ${!n.status || n.status === 'pending' ? 'bg-slate-900 border-emerald-500/30 border-l-4 border-l-emerald-500' : 'bg-slate-800/50 border-slate-700 opacity-70'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className={`font-bold text-sm ${(!n.status || n.status === 'pending') ? 'text-emerald-400' : 'text-slate-400'}`}>Action Requested</h4>
                    <span className="text-[11px] text-slate-500 font-mono">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-[15px] text-slate-300 leading-relaxed font-medium">{n.message}</p>
                  
                  {(!n.status || n.status === 'pending') ? (
                    <div className="mt-5 flex gap-3">
                      <button onClick={() => handleResponse(n.id, 'accept')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded text-sm font-semibold transition-all shadow-lg hover:shadow-emerald-500/20">Accept Assignment</button>
                      <button onClick={() => handleResponse(n.id, 'decline')} className="bg-rose-900/50 outline outline-rose-500/30 hover:bg-rose-900 text-rose-300 px-5 py-2 rounded text-sm font-medium transition-all">Decline</button>
                    </div>
                  ) : (
                    <div className="mt-5 py-2 px-3 rounded inline-block bg-slate-900 border border-slate-700 text-sm font-bold tracking-wide">
                      {n.status === 'accept' ? <span className="text-emerald-500">✔ You accepted this task.</span> : <span className="text-slate-500">✖ You declined this incident.</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
