"use client";

import { useState } from "react";
import Link from "next/link";

import { ArrowLeft, Map as MapIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import DelayedMap from "./DelayedMap";

const SEMANTIC_NODES = [
  "All",
  "Public Health",
  "Water & Sanitation",
  "Infrastructure",
  "Food Security",
  "Education",
  "Emergency Relief"
];

export default function DashboardPage() {
  const [filterCategory, setFilterCategory] = useState("All");

  return (
    <div className="h-screen w-screen bg-background relative overflow-hidden flex flex-col font-sans">
      
      {/* Absolute Full-Screen Map */}
      <div className="absolute inset-0 z-0">
         <DelayedMap filterCategory={filterCategory} />
      </div>

      {/* Floating Header */}
      <div 
        className="z-20 w-full max-w-7xl mx-auto p-4 md:p-6 animate-[slideDown_0.5s_ease-out_both]"
      >
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full bg-background/50 hover:bg-background/80 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
               <MapIcon className="w-6 h-6 text-emerald-500" />
                 Smart Report Hub
              </h1>
              <p className="text-sm text-muted-foreground">Real-time NGO field reports visualization</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-background/50 border border-border/50 rounded-xl p-1.5 shadow-inner">
             <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
               <Filter className="w-4 h-4" />
             </div>
             <select 
               value={filterCategory}
               onChange={(e) => setFilterCategory(e.target.value)}
               className="bg-transparent text-sm font-medium text-foreground py-1 pr-6 focus:outline-none cursor-pointer appearance-none"
             >
               {SEMANTIC_NODES.map((node) => (
                 <option key={node} value={node} className="bg-card text-foreground">{node}</option>
               ))}
             </select>
           </div>
        </Card>
      </div>
    </div>
  );
}
