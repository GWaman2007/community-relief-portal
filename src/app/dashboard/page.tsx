"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

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
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Deduplication Dashboard</h1>
          <p className="text-sm text-slate-500">Real-time NGO field reports visualization</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-600">Filter by Category:</label>
          <select 
            value={filterNode}
            onChange={(e) => setFilterNode(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 shadow-sm outline-none cursor-pointer"
          >
            {SEMANTIC_NODES.map((node) => (
              <option key={node} value={node}>{node}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <MapComponent filterNode={filterNode} />
      </div>
    </div>
  );
}
