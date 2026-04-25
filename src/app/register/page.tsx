"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldAlert, MapPin, Search } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SKILL_OPTIONS = [
  "Medical Doctor", "Nurse", "First Aid Certified", "Mental Health Counselor",
  "Plumber", "Sanitation Expert", "Water Purification", "Manual Labor",
  "Electrician", "Carpenter", "Construction Worker", "Heavy Machinery Operator",
  "Cook/Chef", "Logistics/Driver", "Warehouse Staff", "Teacher",
  "Childcare Provider", "Translator", "Search & Rescue", "Paramedic", "Crowd Management"
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"volunteer" | "ngo">("volunteer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [manualAddress, setManualAddress] = useState("");

  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const getLocation = () => {
    setLocationStatus("Detecting location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationStatus("Location obtained successfully.");
        },
        () => setLocationStatus("GPS unavailable. Please enter your city manually."),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationStatus("Location not supported by browser.");
    }
  };

  const searchAddress = async (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!manualAddress) return;
    setLocationStatus("Geocoding address...");
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setLatitude(parseFloat(data[0].lat));
        setLongitude(parseFloat(data[0].lon));
        setLocationStatus(`Found: ${data[0].display_name}`);
      } else {
        setLocationStatus("Address not found. Please clarify.");
      }
    } catch {
      setLocationStatus("Search failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "volunteer" && (!latitude || !longitude || selectedSkills.length === 0)) {
      return setStatus({ type: 'error', msg: "Volunteers must provide a location and at least one relevant skill." });
    }

    setIsSubmitting(true);
    setStatus(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    });

    if (authError || !authData.user) {
      setIsSubmitting(false);
      return setStatus({ type: 'error', msg: authError?.message || "Registration failed. Please try again." });
    }

    if (role === "volunteer") {
      try {
        const res = await fetch("/api/volunteer/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, skills: selectedSkills, latitude, longitude, auth_id: authData.user.id })
        });
        const regData = await res.json();
        if (!res.ok) throw new Error(regData.error);
      } catch (err: any) {
        setIsSubmitting(false);
        return setStatus({ type: 'error', msg: err?.message || "Failed to create public volunteer profile." });
      }
    } else if (role === "ngo") {
      try {
        const res = await fetch("/api/ngo/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, auth_id: authData.user.id })
        });
        const regData = await res.json();
        if (!res.ok) throw new Error(regData.error);
      } catch (err: any) {
        setIsSubmitting(false);
        return setStatus({ type: 'error', msg: err?.message || "Failed to register NGO account." });
      }
    }

    setStatus({ type: 'success', msg: "Account created successfully! Redirecting..." });
    setTimeout(() => {
      router.push(`/dashboard/${role}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="z-10 absolute top-6 left-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Return to Hub
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl z-10 py-12"
      >
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-2xl shadow-emerald-900/10">
          <CardHeader className="text-center space-y-2 pt-8">
            <div className="mx-auto bg-emerald-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <ShieldAlert className="w-6 h-6 text-emerald-500" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Register</CardTitle>
            <CardDescription className="text-base">
              Register to help with disaster response efforts
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {status && (
                <div className={`p-3 rounded-md text-sm font-medium border ${status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  {status.msg}
                </div>
              )}

              <div className="flex gap-2 p-1.5 rounded-lg bg-background/50 border border-border/50">
                <Button 
                  type="button" 
                  variant={role === "volunteer" ? "default" : "ghost"}
                  className={`flex-1 ${role === "volunteer" ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md" : "text-muted-foreground"}`}
                  onClick={() => setRole("volunteer")}
                >
                  Field Volunteer
                </Button>
                <Button 
                  type="button" 
                  variant={role === "ngo" ? "default" : "ghost"}
                  className={`flex-1 ${role === "ngo" ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md" : "text-muted-foreground"}`}
                  onClick={() => setRole("ngo")}
                >
                  NGO Contributor
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name / Organization Name</Label>
                  <Input id="name" type="text" required value={name} onChange={e=>setName(e.target.value)} className="bg-background/50 border-border/50 focus-visible:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="bg-background/50 border-border/50 focus-visible:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Passkey (Min 6 Characters)</Label>
                  <Input id="password" type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} className="bg-background/50 border-border/50 focus-visible:ring-emerald-500" />
                </div>
              </div>

              {role === "volunteer" && (
                <div className="border-t border-border/40 pt-6 mt-6 space-y-6">
                  <div className="bg-background/30 p-4 rounded-xl border border-border/50 space-y-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2 text-emerald-400">
                        <MapPin className="w-4 h-4" /> Location (Required)
                      </Label>
                      <Button type="button" onClick={getLocation} variant="outline" className="w-full bg-background/50 border-border/50 hover:bg-accent/50">
                        Acquire GPS Signal
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 relative">
                        <Input 
                          type="text" 
                          placeholder="Or triangulate city manually..." 
                          value={manualAddress} 
                          onKeyDown={e => e.key === 'Enter' && searchAddress(e)} 
                          onChange={e => setManualAddress(e.target.value)} 
                          className="bg-background/50 border-border/50 focus-visible:ring-emerald-500 pr-10" 
                        />
                      </div>
                      <Button type="button" onClick={searchAddress} size="icon" className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                    {locationStatus && <p className="text-xs text-muted-foreground">{locationStatus}</p>}
                  </div>

                  <div>
                    <Label className="block mb-3">Field Capabilities & Skills</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border border-border/50 rounded-xl bg-background/30 text-sm">
                      {SKILL_OPTIONS.map(skill => (
                        <Label key={skill} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={selectedSkills.includes(skill)} 
                            onChange={() => handleSkillToggle(skill)} 
                            className="rounded bg-background border-border/50 text-emerald-600 focus:ring-emerald-500 w-4 h-4" 
                          />
                          <span className="font-normal">{skill}</span>
                        </Label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 mt-4 transition-all"
              >
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-border/40 py-6">
            <div className="text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">Sign In</Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
