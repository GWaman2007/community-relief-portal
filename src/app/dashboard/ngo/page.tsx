"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import DelayedMap from "@/app/dashboard/DelayedMap";

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

  if (!profile) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading Auth...</div>;

  if (!profile.is_authorized) {
    if (profile.status === 'revoked') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center flex-col p-4 relative overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-rose-500/10 blur-[150px]" />
          </div>
          <Card className="bg-card/60 backdrop-blur-xl border-destructive/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 z-10 max-w-lg w-full text-center py-10 px-6">
            <h1 className="text-3xl font-black text-destructive tracking-tight flex items-center justify-center gap-2 mb-4">⚠️ Access Revoked</h1>
            <p className="text-muted-foreground leading-relaxed font-medium tracking-wide mb-8">Your NGO operating license has been explicitly suspended by Central Command. Please contact the Platform Administrator directly regarding your access.</p>
            <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-destructive hover:text-destructive-foreground border-destructive/30 hover:bg-destructive">Sign Out</Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-[150px]" />
        </div>
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 z-10 max-w-lg w-full text-center py-10 px-6">
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center justify-center gap-2 mb-4">⏳ Pending Approval</h1>
          <p className="text-muted-foreground leading-relaxed font-medium tracking-wide mb-8">Your NGO credentials are currently under review by the Administrator. Your dashboard will unlock once you receive approval.</p>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-muted-foreground hover:text-foreground border-border/50 hover:bg-accent/50">Return to Hub</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden p-6">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 z-10">
        
        {/* Navigation Bar */}
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                NGO Operations Center
              </h1>
              <p className="text-sm text-muted-foreground">Authorized NGO Dashboard</p>
            </div>
          </div>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="bg-background/50 border-border/50 text-muted-foreground hover:text-foreground">Logout</Button>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2 bg-card/60 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-primary flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Global Sensor Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative min-h-[500px]">
                <DelayedMap filterCategory="All" />
            </CardContent>
          </Card>
          
          <div className="col-span-1">
            <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center justify-center text-center p-8">
               <div className="bg-primary/10 p-4 rounded-full text-primary mb-6">
                 <Plus className="w-12 h-12" />
               </div>
               <h2 className="text-foreground font-black text-2xl mb-2">Deploy Scenario</h2>
               <p className="text-muted-foreground text-sm mb-8 leading-relaxed">Submit verified field reports to the system.</p>
               <Button onClick={() => router.push("/report")} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 shadow-lg shadow-primary/20 transition-all">
                 Launch Field Report
               </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
