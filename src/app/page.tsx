"use client";

import { Suspense, lazy } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowRight, Activity, Users, MapPin, DatabaseZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Lazy-load ALL below-the-fold sections to reduce initial JS bundle & TBT
const BelowTheFold = lazy(() => import("@/app/components/BelowTheFold"));

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">

      {/* Background Effects - pure CSS, no JS needed */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[60%] h-[20%] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* Navigation Bar */}
      <nav className="w-full fixed top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
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

          {/* CRITICAL LCP SECTION — Pure CSS animations, no JS dependency */}
          {/* Uses CSS @keyframes for fade-in so h1 renders immediately without waiting for framer-motion JS */}
          <div
            className="text-center mb-24 flex flex-col items-center animate-[fadeSlideUp_0.6s_ease-out_both]"
          >
            {/* Visual Anchor: Icon-driven Network Abstraction */}
            <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
              {/* Outer Pulse Ring - uses only transform+opacity (GPU composited) */}
              <div className="absolute inset-0 bg-primary/5 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <div className="absolute inset-4 bg-primary/10 rounded-full animate-pulse" />

              {/* Central Hub */}
              <div className="absolute w-20 h-20 bg-card/80 backdrop-blur-md border border-border/50 rounded-full flex items-center justify-center shadow-xl z-20">
                <ShieldAlert className="w-8 h-8 text-primary" />
              </div>

              {/* Connected Nodes - CSS rotation only uses transform (GPU composited) */}
              <div className="absolute inset-0 z-10 animate-[spin_30s_linear_infinite]">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-card/60 backdrop-blur-sm border border-border/30 rounded-full flex items-center justify-center shadow-md">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="absolute bottom-6 right-2 w-10 h-10 bg-card/60 backdrop-blur-sm border border-border/30 rounded-full flex items-center justify-center shadow-md">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div className="absolute bottom-6 left-2 w-10 h-10 bg-card/60 backdrop-blur-sm border border-border/30 rounded-full flex items-center justify-center shadow-md">
                  <DatabaseZap className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>

            <Badge variant="outline" className="mb-6 py-1.5 px-4 bg-primary/10 text-primary border-primary/20 text-sm font-medium tracking-wide rounded-full shadow-sm">
              <Activity className="w-4 h-4 mr-2 inline" />
              Live Relief Efforts
            </Badge>

            {/* LCP ELEMENT — renders immediately, no JS blocking */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-foreground max-w-4xl mx-auto leading-tight">
              Community <span className="text-primary">Relief Portal</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              We connect verified NGOs directly with skilled community volunteers to transform chaotic disaster responses into organized, efficient relief efforts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 shadow-lg shadow-primary/20 hover:scale-105 text-lg">
                  Register as Volunteer <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#live-map" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full rounded-full px-8 h-14 font-bold bg-card/40 backdrop-blur-sm border-border hover:bg-card/80 text-lg">
                  View Live Map
                </Button>
              </Link>
            </div>
          </div>

          {/* BELOW THE FOLD — Lazy loaded to reduce initial JS bundle */}
          <Suspense fallback={
            <div className="w-full flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full bg-primary/20 animate-ping mb-4"></div>
              <p className="text-muted-foreground text-xs font-medium animate-pulse tracking-widest uppercase">Loading content...</p>
            </div>
          }>
            <BelowTheFold />
          </Suspense>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-8 text-center text-sm text-muted-foreground z-10 bg-background/80 backdrop-blur-lg">
        <p>EarthNode © 2026. Community Relief Efforts Platform.</p>
      </footer>
    </div>
  );
}
