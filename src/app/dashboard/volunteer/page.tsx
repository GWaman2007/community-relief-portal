"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Inbox, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

  if (!profile) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Establishing uplink...</div>;

  if (!profile.is_authorized) {
    if (profile.status === 'revoked') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center flex-col p-4 relative overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-rose-500/10 blur-[150px]" />
          </div>
          <Card className="bg-card/60 backdrop-blur-xl border-rose-500/20 shadow-2xl z-10 max-w-lg w-full text-center py-10 px-6">
            <h1 className="text-3xl font-black text-rose-500 tracking-tight flex items-center justify-center gap-2 mb-4">⚠️ Access Revoked</h1>
            <p className="text-muted-foreground leading-relaxed font-medium tracking-wide mb-8">Your volunteer privileges have been explicitly suspended by the Platform Administrator. Please contact the admin directly regarding your access.</p>
            <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-rose-400 hover:text-rose-300 border-rose-500/30 hover:bg-rose-500/10">Sign Out</Button>
          </Card>
        </div>
      );
    }

    if (profile.status === 'ai_rejected') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center flex-col p-4 relative overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-orange-500/10 blur-[150px]" />
          </div>
          <Card className="bg-card/60 backdrop-blur-xl border-orange-500/20 shadow-2xl z-10 max-w-lg w-full text-center py-10 px-6">
            <h1 className="text-3xl font-black text-orange-500 tracking-tight flex items-center justify-center gap-2 mb-4">🤖 AI Screening Failed</h1>
            <p className="text-muted-foreground leading-relaxed font-medium tracking-wide mb-4">Our automated vetting system has flagged your profile. An administrator may still manually approve your access.</p>
            <div className="bg-background/50 border border-border/50 p-4 rounded-lg text-sm font-mono text-muted-foreground mb-8">
              {profile.rejection_reason || "No additional details provided."}
            </div>
            <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-orange-400 hover:text-orange-300 border-orange-500/30 hover:bg-orange-500/10">Sign Out</Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-[150px]" />
        </div>
        <Card className="bg-card/60 backdrop-blur-xl border-amber-500/20 shadow-2xl z-10 max-w-lg w-full text-center py-10 px-6">
          <h1 className="text-3xl font-black text-amber-500 tracking-tight flex items-center justify-center gap-2 mb-4">⏳ AI Review In Progress</h1>
          <p className="text-muted-foreground leading-relaxed font-medium tracking-wide mb-8">Our AI screening system is currently reviewing your volunteer profile. This process is usually instant — please refresh in a few seconds.</p>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-amber-500 hover:text-amber-400 border-amber-500/30 hover:bg-amber-500/10">Return to Hub</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans p-6">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 z-10">
        
        {/* Navigation Bar */}
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-2xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Volunteer Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Authorized Volunteer Command</p>
            </div>
          </div>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="bg-background/50 border-border/50 text-muted-foreground hover:text-foreground">Disengage</Button>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden flex flex-col">
             <CardHeader className="pb-4">
               <CardTitle className="text-indigo-400 flex items-center gap-2 text-sm uppercase tracking-widest">
                 <MapPin className="w-4 h-4" /> Global Heatmap Sensor
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0 flex-1 relative min-h-[400px]">
               <MapComponent filterNode="All" />
             </CardContent>
           </Card>
           
           <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-xl h-full flex flex-col items-center justify-center text-center p-8">
              <div className="bg-emerald-500/10 p-6 rounded-full text-emerald-400 mb-6">
                <Inbox className="w-16 h-16" />
              </div>
              <h2 className="text-foreground font-black text-2xl mb-2">Secure Dispatch Inbox</h2>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-sm">Access your targeted geographic alerts when the AI algorithm matches your specific skills to an active sector incident.</p>
              <Button onClick={() => router.push("/inbox")} size="lg" className="w-full max-w-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-14 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all uppercase tracking-widest">
                Open Secure Inbox
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
}
