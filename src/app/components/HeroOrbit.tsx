import { ShieldAlert, Users, MapPin, DatabaseZap } from "lucide-react";

export default function HeroOrbit() {
  return (
    <div className="relative w-48 h-48 mb-10 flex items-center justify-center">
      {/* Outer Pulse Ring - transform+opacity only (GPU composited) */}
      <div className="absolute inset-0 bg-primary/5 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
      <div className="absolute inset-4 bg-primary/10 rounded-full animate-pulse" />

      {/* Central Hub */}
      <div className="absolute w-20 h-20 bg-card/80 border border-border/50 rounded-full flex items-center justify-center shadow-xl z-20">
        <ShieldAlert className="w-8 h-8 text-primary" />
      </div>

      {/* Connected Nodes - CSS rotation (transform only, GPU composited) */}
      <div className="absolute inset-0 z-10 animate-[spin_30s_linear_infinite]">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-card/60 border border-border/30 rounded-full flex items-center justify-center shadow-md">
          <Users className="w-4 h-4 text-primary" />
        </div>
        <div className="absolute bottom-6 right-2 w-10 h-10 bg-card/60 border border-border/30 rounded-full flex items-center justify-center shadow-md">
          <MapPin className="w-4 h-4 text-primary" />
        </div>
        <div className="absolute bottom-6 left-2 w-10 h-10 bg-card/60 border border-border/30 rounded-full flex items-center justify-center shadow-md">
          <DatabaseZap className="w-4 h-4 text-primary" />
        </div>
      </div>
    </div>
  );
}
