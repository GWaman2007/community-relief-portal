"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, ShieldAlert, Activity, Users, MapPin, DatabaseZap } from "lucide-react";
import LiveMetricsHUD from "@/app/components/LiveMetricsHUD";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MapComponent = dynamic(() => import("@/app/dashboard/MapComponent"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden font-sans">
      
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

      <main className="flex-1 flex flex-col items-center pt-32 pb-16 px-6 z-10 relative">
        <div className="max-w-5xl w-full">
          
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16 mt-8"
          >
            <Badge variant="outline" className="mb-6 py-1.5 px-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-sm font-medium tracking-wide rounded-full">
              <Activity className="w-4 h-4 mr-2 inline" />
              Live Relief Efforts
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
              Community <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-transparent bg-clip-text">Relief Portal</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Our decentralized relief efforts architecture leverages real-time AI modeling to deduplicate field reports and securely triangulate skilled community volunteers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="rounded-full px-8 bg-foreground text-background hover:bg-foreground/90 font-bold h-12 shadow-xl shadow-foreground/10 transition-all hover:scale-105">
                  Register as Volunteer <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 font-bold bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent/50 transition-all">
                  View Live Map
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-emerald-500/5 transition-all hover:-translate-y-1">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <DatabaseZap className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">AI Deduplication</div>
                  <div className="text-sm text-muted-foreground">Real-time signal filtering</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-cyan-500/5 transition-all hover:-translate-y-1">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">Geo-Triangulation</div>
                  <div className="text-sm text-muted-foreground">Precise incident mapping</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-indigo-500/5 transition-all hover:-translate-y-1">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">Multi-Tenant RBAC</div>
                  <div className="text-sm text-muted-foreground">Secure volunteer dispatch</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Map Display Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <Card className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl shadow-emerald-900/10">
              <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <span className="relative flex h-3 w-3 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      Live Crisis Map
                    </CardTitle>
                    <CardDescription className="mt-1.5">
                      Real-time updates from active crisis zones.
                    </CardDescription>
                  </div>
                  <Badge variant="destructive" className="bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 w-fit">
                    Live Feed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b border-border/40 bg-background/30">
                  <LiveMetricsHUD />
                </div>
                <div className="h-[500px] w-full opacity-90 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 pointer-events-none z-10" />
                  <MapComponent filterNode="All" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-8 text-center text-sm text-muted-foreground z-10 bg-background/80 backdrop-blur-lg">
        <p>EarthNode © 2026. Community Relief Efforts Platform.</p>
      </footer>
    </div>
  );
}
