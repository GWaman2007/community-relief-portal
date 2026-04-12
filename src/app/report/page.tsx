"use client";

import { useState, useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function FieldPortal() {
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert("NGO login required to submit field reports.");
        setTimeout(() => router.push("/login"), 100);
      } else if (session.user.user_metadata?.role !== 'ngo') {
        alert("Access Denied: Only designated NGO Contributors can submit active field reports.");
        setTimeout(() => router.push("/dashboard"), 100);
      }
    });
  }, [router]);

  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLocation = () => {
    setLocationStatus("Fetching location via GPS...");
    if (navigator.geolocation && (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationStatus("Location captured successfully!");
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationStatus("GPS failed or blocked. Please use manual address search.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationStatus("GPS blocked on insecure HTTP networks. Please use manual address search.");
    }
  };

  const getManualLocation = async () => {
    if (!manualAddress) {
      setLocationStatus("Please enter an address to search.");
      return;
    }
    setLocationStatus("Searching address...");
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setLatitude(parseFloat(data[0].lat));
        setLongitude(parseFloat(data[0].lon));
        setLocationStatus(`Location found: ${data[0].display_name}`);
      } else {
        setLocationStatus("Address not found. Add city and country.");
      }
    } catch (err) {
      setLocationStatus("Address search failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latitude || !longitude) {
      alert("Please get your location first (via GPS or Manual Search).");
      return;
    }
    if (!text) {
      alert("Please enter report text.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        text,
        image_base64: image,
        latitude,
        longitude
      };

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/process-report", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${session?.access_token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Report submitted successfully!");
        setText("");
        setImage(null);
        setManualAddress("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setMessage(`Error: ${data.error || data.message || "Failed processing"}`);
      }
    } catch (err) {
      setMessage("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold tracking-tight">Field Portal</h1>
          <p className="text-blue-100 text-sm mt-1">Submit NGO Field Reports</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('Error') || message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Report Details</label>
            <textarea 
              className="w-full border border-slate-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-black"
              placeholder="Describe the situation here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Image (Optional)</label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <svg className="w-8 h-8 mb-3 text-slate-400 mx-auto" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Tap to select image</span></p>
                </div>
                <input id="image-upload" ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            {image && (
              <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 relative">
                <img src={image} alt="Preview" className="w-full h-auto object-cover max-h-48" />
                <button type="button" onClick={() => setImage(null)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md hover:bg-red-700 text-xs">X</button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
            <button 
              type="button" 
              onClick={getLocation}
              className="w-full bg-slate-800 text-white py-2.5 rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              Get GPS Location
            </button>
            <div className="flex gap-2">
              <input 
                 type="text" 
                 placeholder="Or type address manually..." 
                 value={manualAddress}
                 onChange={(e) => setManualAddress(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     e.preventDefault();
                     getManualLocation();
                   }
                 }}
                 className="flex-1 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 outline-none text-black"
              />
              <button 
                 type="button" 
                 onClick={getManualLocation}
                 className="bg-blue-600 text-white px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                 Search
              </button>
            </div>
            {locationStatus && (
              <p className="text-xs text-center mt-2 text-slate-600">{locationStatus}</p>
            )}
            {latitude && longitude && (
              <p className="text-xs text-center mt-1 font-mono text-blue-600">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !latitude || !longitude}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isSubmitting ? "Processing..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
