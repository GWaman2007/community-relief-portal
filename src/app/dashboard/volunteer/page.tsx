"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/app/dashboard/MapComponent"), { ssr: false });

export default function VolunteerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return setTimeout(() => router.push("/login"), 100);
      }
      
      const { data } = await supabase.from("volunteers").select("*").eq("auth_id", session.user.id).single();
      if (!data) return setTimeout(() => router.push("/register"), 100);
      
      setProfile(data);
    }
    checkAuth();
  }, [router]);

  if (!profile) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Establishing uplink...</div>;

  if (!profile.is_authorized) {
    if (profile.status === 'revoked') {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white flex-col">
          <h1 className="text-3xl font-black text-rose-500 tracking-tight flex items-center gap-2">⚠️ Access Revoked</h1>
          <p className="text-slate-400 mt-2 max-w-lg text-center leading-relaxed font-medium tracking-wide">Your volunteer privileges have been explicitly suspended by the Platform Administrator. Please contact the admin directly regarding your access.</p>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="mt-8 text-rose-400 font-bold hover:underline border border-rose-500/30 px-6 py-2 rounded">Sign Out</button>
        </div>
      );
    }

    if (profile.status === 'ai_rejected') {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white flex-col">
          <h1 className="text-3xl font-black text-orange-500 tracking-tight flex items-center gap-2">🤖 AI Screening Failed</h1>
          <p className="text-slate-400 mt-2 max-w-lg text-center leading-relaxed font-medium tracking-wide">Our automated vetting system has flagged your profile. An administrator may still manually approve your access.</p>
          <p className="text-slate-500 mt-4 text-xs font-mono bg-slate-800 px-4 py-2 rounded border border-slate-700">{profile.rejection_reason || "No additional details provided."}</p>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="mt-8 text-orange-400 font-bold hover:underline border border-orange-500/30 px-6 py-2 rounded">Sign Out</button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white flex-col">
        <h1 className="text-3xl font-black text-amber-500 tracking-tight flex items-center gap-2">⏳ AI Review In Progress</h1>
        <p className="text-slate-400 mt-2 max-w-lg text-center leading-relaxed font-medium tracking-wide">Our AI screening system is currently reviewing your volunteer profile. This process is usually instant — please refresh in a few seconds.</p>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="mt-8 text-amber-500/70 font-bold hover:text-amber-400 hover:underline border border-amber-500/30 px-6 py-2 rounded transition-colors">Return to Root</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3"><span className="text-emerald-500">👷</span> Field Operative Dashboard</h1>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2 rounded-lg shadow-lg border border-slate-700 transition">Disengage</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-4">
               <h2 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-3 border-b border-slate-700 pb-2">Global Heatmap Sensor</h2>
               <MapComponent filterNode="All" />
           </div>
           
           <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-6 flex flex-col items-center justify-center space-y-6 text-center">
               <span className="text-[100px]">📥</span>
               <div>
                  <h2 className="text-2xl font-bold text-white mb-2">My Dispatch Inbox</h2>
                  <p className="text-slate-400 max-w-sm">Access your targeted geographic alerts when the AI algorithm matches your specific skills to an active sector incident.</p>
               </div>
               <button onClick={() => router.push("/inbox")} className="w-full max-w-md bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all uppercase">Open Secure Inbox</button>
           </div>
        </div>
      </div>
    </div>
  );
}
