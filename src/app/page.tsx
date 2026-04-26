"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { m, LazyMotion, domAnimation } from "framer-motion";
import { ArrowRight, ShieldAlert, Activity, Users, MapPin, DatabaseZap } from "lucide-react";
import LiveMetricsHUD from "@/app/components/LiveMetricsHUD";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MapComponent = dynamic(() => import("@/app/dashboard/MapComponent"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-card/40 rounded-xl">
      <div className="w-12 h-12 rounded-full bg-primary/20 animate-ping mb-4"></div>
      <p className="text-muted-foreground text-sm font-medium animate-pulse tracking-widest uppercase">Initializing Map...</p>
    </div>
  )
});

export default function Home() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[60%] h-[20%] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* Navigation Bar */}
      <nav className="w-full fixed top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-500" />
            <span className="font-bold text-lg tracking-tight">EarthNode</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="font-semibold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white border-0">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center pt-32 pb-24 px-6 z-10 relative">
        <div className="max-w-6xl w-full">
          
          {/* Typographic & Glassmorphic Hero Section */}
          <m.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-24 flex flex-col items-center"
          >
            {/* Visual Anchor: Icon-driven Network Abstraction */}
            <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
              {/* Outer Pulse Ring */}
              <div className="absolute inset-0 bg-primary/5 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <div className="absolute inset-4 bg-primary/10 rounded-full animate-pulse" />
              
              {/* Central Hub */}
              <div className="absolute w-20 h-20 bg-card/80 backdrop-blur-md border border-border/50 rounded-full flex items-center justify-center shadow-xl z-20">
                <ShieldAlert className="w-8 h-8 text-primary" />
              </div>

              {/* Connected Nodes */}
              <m.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute inset-0 z-10">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-card/60 backdrop-blur-sm border border-border/30 rounded-full flex items-center justify-center shadow-md">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="absolute bottom-6 right-2 w-10 h-10 bg-card/60 backdrop-blur-sm border border-border/30 rounded-full flex items-center justify-center shadow-md">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div className="absolute bottom-6 left-2 w-10 h-10 bg-card/60 backdrop-blur-sm border border-border/30 rounded-full flex items-center justify-center shadow-md">
                  <DatabaseZap className="w-4 h-4 text-primary" />
                </div>
              </m.div>
            </div>

            <Badge variant="outline" className="mb-6 py-1.5 px-4 bg-primary/10 text-primary border-primary/20 text-sm font-medium tracking-wide rounded-full shadow-sm">
              <Activity className="w-4 h-4 mr-2 inline" />
              Live Relief Efforts
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-foreground max-w-4xl mx-auto leading-tight">
              Community <span className="text-primary">Relief Portal</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              We connect verified NGOs directly with skilled community volunteers to transform chaotic disaster responses into organized, efficient relief efforts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 shadow-lg shadow-primary/20 transition-all hover:scale-105 text-lg">
                  Register as Volunteer <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#live-map" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full rounded-full px-8 h-14 font-bold bg-card/40 backdrop-blur-sm border-border hover:bg-card/80 transition-all text-lg">
                  View Live Map
                </Button>
              </Link>
            </div>
          </m.div>

          {/* Persuasive About Us Section */}
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-24"
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Why Join EarthNode?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                By harnessing the power of collective intelligence and real-time mapping, we empower communities to rebuild faster and safer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-card/60 backdrop-blur-xl border border-border/50 shadow-xl shadow-background/5 p-8 transition-transform hover:-translate-y-1">
                <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <DatabaseZap className="text-primary w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Smart Report Filtering</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our system instantly cross-references incoming field reports, filtering duplicate reports so relief coordinators can focus on verified crises.
                </p>
              </Card>

              <Card className="bg-card/60 backdrop-blur-xl border border-border/50 shadow-xl shadow-background/5 p-8 transition-transform hover:-translate-y-1">
                <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <MapPin className="text-primary w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Real-Time Crisis Mapping</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Submit field reports instantly. Our platform maps out critical zones in real-time, providing a unified picture of the situation on the ground.
                </p>
              </Card>

              <Card className="bg-card/60 backdrop-blur-xl border border-border/50 shadow-xl shadow-background/5 p-8 transition-transform hover:-translate-y-1">
                <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <Users className="text-primary w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Secure Routing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Volunteers are securely dispatched only to zones where their specific skills are needed, ensuring safety and maximizing community impact.
                </p>
              </Card>
            </div>
          </m.div>

          {/* Map Display Card */}
          <m.div
            id="live-map"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Card className="overflow-hidden border border-border/50 bg-card/60 backdrop-blur-2xl shadow-2xl">
              <CardHeader className="border-b border-border/40 bg-card/40 pb-5 pt-6 px-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-foreground">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                      Live Crisis Map
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      Real-time updates from active crisis zones.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-semibold rounded-full">
                    Live Feed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 border-b border-border/40 bg-background/40">
                  <LiveMetricsHUD />
                </div>
                <div className="h-[600px] w-full relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10 pointer-events-none z-10" />
                  {/* DO NOT TOUCH MAP COMPONENT EXISTING LOGIC */}
                  <MapComponent filterCategory="All" />
                </div>
              </CardContent>
            </Card>
          </m.div>
          
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-8 text-center text-sm text-muted-foreground z-10 bg-background/80 backdrop-blur-lg">
        <p>EarthNode © 2026. Community Relief Efforts Platform.</p>
      </footer>
    </div>
    </LazyMotion>
  );
}
