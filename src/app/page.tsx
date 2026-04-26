import Link from "next/link";
import { ShieldAlert, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HeroOrbit from "@/app/components/HeroOrbit";
import BelowTheFoldLoader from "@/app/components/BelowTheFoldLoader";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">

      {/* Background Effects - pure CSS, zero JS */}
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

          {/* CRITICAL LCP SECTION — Server-rendered HTML, pure CSS animation */}
          <div className="text-center mb-24 flex flex-col items-center animate-[slideUp_0.6s_ease-out_both]">
            
            {/* Visual Anchor — Server Component */}
            <HeroOrbit />

            <Badge variant="outline" className="mb-6 py-1.5 px-4 bg-primary/10 text-primary border-primary/20 text-sm font-medium tracking-wide rounded-full shadow-sm">
              <Activity className="w-4 h-4 mr-2 inline" />
              Live Relief Efforts
            </Badge>

            {/* LCP ELEMENT — Server-rendered HTML, zero JS, full opacity */}
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
                <Button size="lg" variant="outline" className="w-full rounded-full px-8 h-14 font-bold bg-card/40 border-border hover:bg-card/80 text-lg">
                  View Live Map
                </Button>
              </Link>
            </div>
          </div>

          {/* BELOW THE FOLD — Client-only wrapper (ssr:false) */}
          <BelowTheFoldLoader />

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-8 text-center text-sm text-muted-foreground z-10 bg-background/80">
        <p>EarthNode © 2026. Community Relief Efforts Platform.</p>
      </footer>
    </div>
  );
}
