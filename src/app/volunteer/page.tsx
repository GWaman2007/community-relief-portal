"use client";

import { useState } from "react";
import Link from "next/link";

import { ArrowLeft, MapPin, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const SKILL_OPTIONS = [
  "Medical Doctor", "Nurse", "First Aid Certified", "Mental Health Counselor",
  "Plumber", "Sanitation Expert", "Water Purification", "Manual Labor",
  "Electrician", "Carpenter", "Construction Worker", "Heavy Machinery Operator",
  "Cook/Chef", "Logistics/Driver", "Warehouse Staff", "Teacher",
  "Childcare Provider", "Translator", "Search & Rescue", "Paramedic", "Crowd Management"
];

export default function VolunteerSignUp() {
  const [name, setName] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [manualAddress, setManualAddress] = useState("");

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const getLocation = () => {
    setLocationStatus("Fetching location via GPS...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationStatus("Location captured successfully!");
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationStatus("GPS failed or blocked. Try manual search below.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationStatus("GPS not supported on this browser.");
    }
  };

  const searchAddress = async (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!manualAddress) return;
    
    setLocationStatus("Searching address...");
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setLatitude(parseFloat(data[0].lat));
        setLongitude(parseFloat(data[0].lon));
        setLocationStatus(`Found: ${data[0].display_name}`);
      } else {
        setLocationStatus("Address not found. Please try again.");
      }
    } catch (e) {
      setLocationStatus("Geocoding failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latitude || !longitude) return alert("Please grab your location first.");
    if (selectedSkills.length === 0) return alert("Please select at least one skill.");

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/volunteer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, skills: selectedSkills, latitude, longitude })
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', msg: "Successfully registered! You will receive dispatches in your inbox." });
        setName("");
        setSelectedSkills([]);
        setLatitude(null);
        setLongitude(null);
        setLocationStatus("");
      } else {
        setStatus({ type: 'error', msg: data.error || "Failed to register." });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: "Server connection failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <div className="z-20 absolute top-6 left-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Return to Hub
          </Button>
        </Link>
      </div>

      <div
        className="w-full max-w-lg z-10 py-12 animate-[slideUp_0.5s_ease-out_both]"
      >
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-2xl shadow-emerald-900/10">
          <CardHeader className="text-center space-y-2 pt-8">
            <div className="mx-auto bg-emerald-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <UserPlus className="w-6 h-6 text-emerald-500" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Volunteer Network</CardTitle>
            <CardDescription className="text-base">
              Join the relief efforts volunteer network
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {status && (
                <div className={`p-3 rounded-md text-sm font-medium border ${status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  {status.msg}
                </div>
              )}

              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background/50 border-border/50 focus-visible:ring-emerald-500 h-12"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label>My Location (Required)</Label>
                <div className="bg-background/30 p-4 rounded-xl border border-border/50 space-y-4">
                  <Button 
                    type="button" 
                    onClick={getLocation}
                    variant="outline"
                    className="w-full bg-background/50 border-border/50 hover:bg-accent/50 text-foreground"
                  >
                    <MapPin className="w-4 h-4 mr-2 text-emerald-500" /> Pinpoint My Live Location
                  </Button>

                  <div className="flex gap-2">
                    <Input 
                      type="text" 
                      placeholder="Or enter city manually..." 
                      value={manualAddress}
                      onChange={e => setManualAddress(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && searchAddress(e)}
                      className="bg-background/50 border-border/50 focus-visible:ring-emerald-500"
                    />
                    <Button 
                      type="button" 
                      onClick={searchAddress}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  {locationStatus && (
                    <p className="text-xs text-center mt-3 text-muted-foreground">{locationStatus}</p>
                  )}
                  {latitude && longitude && (
                    <p className="text-xs text-center mt-1 text-emerald-400">
                      {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Your Skills</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-4 bg-background/30 border border-border/50 rounded-xl">
                  {SKILL_OPTIONS.map(skill => (
                    <div key={skill} className="flex items-start space-x-2 p-1">
                      <Checkbox 
                        id={skill}
                        checked={selectedSkills.includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                        className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 border-muted-foreground/50 mt-0.5"
                      />
                      <label htmlFor={skill} className="text-sm text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">{skill}</label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !latitude || !longitude || selectedSkills.length === 0 || !name}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Registering..." : "Register as Volunteer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
