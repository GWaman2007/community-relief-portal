"use client";

import { m, LazyMotion, domAnimation } from "framer-motion";
import { Users, MapPin, DatabaseZap } from "lucide-react";
import LiveMetricsHUD from "@/app/components/LiveMetricsHUD";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DelayedMap from "@/app/dashboard/DelayedMap";

export default function BelowTheFold() {
  return (
    <LazyMotion features={domAnimation}>
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
          <Card className="bg-card/60 backdrop-blur-xl border border-border/50 shadow-xl shadow-background/5 p-8 transition-[transform,box-shadow] duration-300 hover:-translate-y-1">
            <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <DatabaseZap className="text-primary w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Smart Report Filtering</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our system instantly cross-references incoming field reports, filtering duplicate reports so relief coordinators can focus on verified crises.
            </p>
          </Card>

          <Card className="bg-card/60 backdrop-blur-xl border border-border/50 shadow-xl shadow-background/5 p-8 transition-[transform,box-shadow] duration-300 hover:-translate-y-1">
            <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <MapPin className="text-primary w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Real-Time Crisis Mapping</h3>
            <p className="text-muted-foreground leading-relaxed">
              Submit field reports instantly. Our platform maps out critical zones in real-time, providing a unified picture of the situation on the ground.
            </p>
          </Card>

          <Card className="bg-card/60 backdrop-blur-xl border border-border/50 shadow-xl shadow-background/5 p-8 transition-[transform,box-shadow] duration-300 hover:-translate-y-1">
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
              <DelayedMap filterCategory="All" />
            </div>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
}
