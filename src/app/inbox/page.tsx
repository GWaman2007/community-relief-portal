"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ArrowLeft, Inbox as InboxIcon, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading inbox...</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="z-20 absolute top-6 left-6">
        <Link href="/dashboard/volunteer">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Return to Hub
          </Button>
        </Link>
      </div>

      <div className="max-w-3xl w-full mx-auto z-10 pt-12">
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-2xl p-4 md:p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <InboxIcon className="text-primary w-8 h-8" /> Volunteer Inbox
            </h1>
            <p className="text-primary mt-1 text-sm tracking-widest uppercase">Volunteer: {volunteerRecord.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="bg-background/50 border-border/50 text-muted-foreground hover:text-foreground">
            Logout
          </Button>
        </Card>

        <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-2xl h-[70vh] flex flex-col overflow-hidden">
          <CardContent className="flex-1 p-6 overflow-y-auto space-y-4">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <InboxIcon className="w-16 h-16 mb-4 text-muted-foreground" />
                <p className="font-medium text-lg">No dispatch notifications yet.</p>
                <p className="text-sm">We will notify you when volunteers are needed nearby.</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div 
                  key={n.id} 
                  className={`border p-5 rounded-xl transition-colors shadow-sm animate-[slideUp_0.4s_ease-out_both] ${!n.status || n.status === 'pending' ? 'bg-background/80 border-primary/30 border-l-4 border-l-primary' : 'bg-background/30 border-border/50'}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className={`font-bold text-sm flex items-center gap-2 ${(!n.status || n.status === 'pending') ? 'text-primary' : 'text-muted-foreground'}`}>
                      Action Requested
                    </h4>
                    <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-base text-foreground leading-relaxed font-medium">{n.message}</p>
                  
                  {(!n.status || n.status === 'pending') ? (
                    <div className="mt-5 flex gap-3">
                      <Button onClick={() => handleResponse(n.id, 'accept')} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors shadow-lg hover:shadow-primary/20">
                        <CheckCircle className="w-4 h-4 mr-2" /> Accept Assignment
                      </Button>
                      <Button variant="outline" onClick={() => handleResponse(n.id, 'decline')} className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive-foreground transition-colors">
                        <XCircle className="w-4 h-4 mr-2" /> Decline
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-5 py-2 px-3 rounded-lg inline-flex items-center gap-2 bg-background/80 border border-border/50 text-sm font-bold tracking-wide">
                      {n.status === 'accept' ? <span className="text-primary flex items-center gap-2"><CheckCircle className="w-4 h-4" /> You accepted this task.</span> : <span className="text-muted-foreground flex items-center gap-2"><XCircle className="w-4 h-4" /> You declined this incident.</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
