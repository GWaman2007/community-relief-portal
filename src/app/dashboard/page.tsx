"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Map as MapIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const MapComponent = dynamic(() => import("./MapComponent"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-card/40 rounded-xl">
      <div className="w-12 h-12 rounded-full bg-primary/20 animate-ping mb-4"></div>
      <p className="text-muted-foreground text-sm font-medium animate-pulse tracking-widest uppercase">Initializing Map...</p>
    </div>
  )
});

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
  const [filterNode, setFilterNode] = useState("All");

  return (
    <div className="h-screen w-screen bg-background relative overflow-hidden flex flex-col font-sans">
      
      {/* Absolute Full-Screen Map */}
      <div className="absolute inset-0 z-0">
        <MapComponent filterNode={filterNode} />
      </div>

      {/* Floating Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-20 w-full max-w-7xl mx-auto p-4 md:p-6"
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
                AI Deduplication Engine
              </h1>
              <p className="text-sm text-muted-foreground">Real-time NGO field reports visualization</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-background/50 border border-border/50 rounded-xl p-1.5 shadow-inner">
            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
              <Filter className="w-4 h-4" />
            </div>
            <select 
              value={filterNode}
              onChange={(e) => setFilterNode(e.target.value)}
              className="bg-transparent text-sm font-medium text-foreground py-1 pr-6 focus:outline-none cursor-pointer appearance-none"
            >
              {SEMANTIC_NODES.map((node) => (
                <option key={node} value={node} className="bg-card text-foreground">{node}</option>
              ))}
            </select>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
