"use client";

import { useState } from "react";

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-emerald-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold tracking-tight">Volunteer Registration</h1>
          <p className="text-emerald-100 text-sm mt-1">Join the disaster response network</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {status && (
            <div className={`p-3 rounded-lg text-sm font-medium ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {status.msg}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-black"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">My Location (Required)</label>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <button 
                type="button" 
                onClick={getLocation}
                className="w-full bg-slate-800 text-white py-2.5 rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Pinpoint My Live Location
              </button>

              <div className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Or enter city manually..." 
                  value={manualAddress}
                  onChange={e => setManualAddress(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchAddress(e)}
                  className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm text-black"
                />
                <button 
                  type="button" 
                  onClick={searchAddress}
                  className="bg-emerald-600 text-white px-4 py-2 rounded text-sm font-semibold whitespace-nowrap"
                >
                  Search
                </button>
              </div>

              {locationStatus && (
                <p className="text-xs text-center mt-3 text-slate-600">{locationStatus}</p>
              )}
              {latitude && longitude && (
                <p className="text-xs text-center mt-1 font-mono text-emerald-600">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Your Skills</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg shadow-inner">
              {SKILL_OPTIONS.map(skill => (
                <label key={skill} className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer p-1 hover:bg-slate-100 rounded">
                  <input 
                    type="checkbox" 
                    checked={selectedSkills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !latitude || !longitude || selectedSkills.length === 0 || !name}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-4"
          >
            {isSubmitting ? "Registering..." : "Register to Dispatch Network"}
          </button>
        </form>
      </div>
    </div>
  );
}
