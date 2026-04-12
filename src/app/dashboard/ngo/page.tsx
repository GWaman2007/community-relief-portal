"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/app/dashboard/MapComponent"), { ssr: false });

export default function NgoDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: ngo } = await supabase.from('ngos').select('is_authorized, status').eq('auth_id', user.id).single();
      if (!ngo) return setTimeout(() => router.push("/register"), 100);
      
      setProfile(ngo);
    }
    checkAuth();
  }, [router]);

  if (!profile) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Auth...</div>;

  if (!profile.is_authorized) {
    if (profile.status === 'revoked') {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white flex-col">
          <h1 className="text-3xl font-black text-rose-500 tracking-tight flex items-center gap-2">⚠️ Access Revoked</h1>
          <p className="text-slate-400 mt-2 max-w-lg text-center leading-relaxed font-medium tracking-wide">Your NGO operating license has been explicitly suspended by Central Command. Please contact the Platform Administrator directly regarding your access.</p>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="mt-8 text-rose-400 font-bold hover:underline border border-rose-500/30 px-6 py-2 rounded">Sign Out</button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white flex-col">
        <h1 className="text-3xl font-black text-amber-500 tracking-tight flex items-center gap-2">⏳ Pending Administrator Approval</h1>
        <p className="text-slate-400 mt-2 max-w-lg text-center leading-relaxed font-medium tracking-wide">Your NGO credentials are currently under review by Central Command. Your dashboard will unlock once you receive global operational clearance.</p>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="mt-8 text-amber-500/70 font-bold hover:text-amber-400 hover:underline border border-amber-500/30 px-6 py-2 rounded transition-colors">Return to Root</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto flex gap-6 flex-col lg:flex-row">
        <div className="flex-1 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h1 className="font-bold text-xl text-white">📍 Global Sensor Coverage</h1>
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded">Logout</button>
          </div>
          <MapComponent filterNode="All" />
        </div>
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col items-center text-center">
             <h2 className="text-emerald-400 font-black text-2xl mb-1">Upload New Scenario</h2>
             <p className="text-slate-400 text-sm mb-4">Deploy active data to the AI deduplication pipeline.</p>
             <button onClick={() => router.push("/report")} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg transition">Submit Field Report Portal</button>
          </div>
        </div>
      </div>
    </div>
  );
}
