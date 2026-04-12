"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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

    // 1. Supabase Auth Signup - Explicitly injecting role string
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    });

    if (authError || !authData.user) {
      setIsSubmitting(false);
      return setStatus({ type: 'error', msg: authError?.message || "Registration failed. Please try again." });
    }

    // 2. Tie public records to UUID
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
        return setStatus({ type: 'error', msg: err?.message || "Failed to establish designated NGO node." });
      }
    }

    setStatus({ type: 'success', msg: "Account created successfully! Redirecting..." });
    setTimeout(() => {
      router.push(`/dashboard/${role}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden text-slate-800">
        <div className="bg-emerald-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Register Account</h1>
          <p className="text-emerald-100 text-sm mt-1">Join the community relief network</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {status && (
            <div className={`p-3 rounded text-sm font-medium ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {status.msg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
            <button type="button" onClick={() => setRole("volunteer")} className={`py-2 rounded font-semibold text-xs md:text-sm transition-all ${role === "volunteer" ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>Field Volunteer</button>
            <button type="button" onClick={() => setRole("ngo")} className={`py-2 rounded font-semibold text-xs md:text-sm transition-all ${role === "ngo" ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>NGO Contributor</button>
          </div>

          <div><label className="block text-sm font-semibold mb-1">Full Name</label><input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-emerald-500 focus:border-emerald-500" /></div>
          <div><label className="block text-sm font-semibold mb-1">Email Address</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-emerald-500 focus:border-emerald-500" /></div>
          <div><label className="block text-sm font-semibold mb-1">Password</label><input type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-emerald-500 focus:border-emerald-500" /></div>

          {role === "volunteer" && (
            <div className="border-t pt-4 mt-4 space-y-5">
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <label className="block text-sm font-semibold mb-2">My Location (Required)</label>
                <button type="button" onClick={getLocation} className="w-full bg-slate-800 text-white font-medium py-2 rounded hover:bg-slate-700 transition">Get My Location</button>
                <div className="mt-3 flex gap-2">
                  <input type="text" placeholder="Or enter city manually..." value={manualAddress} onKeyDown={e => e.key === 'Enter' && searchAddress(e)} onChange={e => setManualAddress(e.target.value)} className="flex-1 border rounded px-3 py-2 text-sm outline-none" />
                  <button type="button" onClick={searchAddress} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm font-medium">Search</button>
                </div>
                {locationStatus && <p className="text-xs text-center mt-3 text-slate-500">{locationStatus}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Select Your Skills</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border rounded bg-slate-50 text-sm">
                  {SKILL_OPTIONS.map(skill => (
                    <label key={skill} className="flex items-center space-x-2 cursor-pointer p-1 rounded"><input type="checkbox" checked={selectedSkills.includes(skill)} onChange={() => handleSkillToggle(skill)} className="rounded text-emerald-600 focus:ring-emerald-500" /><span>{skill}</span></label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white font-semibold py-3 rounded mt-4 hover:bg-emerald-700 disabled:opacity-70">{isSubmitting ? "Processing..." : "Create Account"}</button>
          
          <div className="text-center text-sm mt-4 text-slate-500">
            Already have an account? <a href="/login" className="text-emerald-600 font-bold hover:underline">Log in</a>
          </div>
        </form>
      </div>
    </div>
  );
}
