"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Search, UploadCloud, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="z-10 absolute top-6 left-6">
        <Link href="/dashboard/ngo">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl z-10 py-12"
      >
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-2xl shadow-cyan-900/10">
          <CardHeader className="text-center space-y-2 pt-8">
            <div className="mx-auto bg-cyan-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <UploadCloud className="w-6 h-6 text-cyan-500" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Field Portal</CardTitle>
            <CardDescription className="text-base">
              Submit critical NGO field reports to the AI pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <div className={`p-3 rounded-md text-sm font-medium border ${message.includes('Error') || message.includes('Failed') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  {message}
                </div>
              )}

              <div className="space-y-2">
                <Label>Report Details</Label>
                <textarea 
                  className="w-full border border-border/50 bg-background/50 text-foreground rounded-lg p-3 h-32 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none"
                  placeholder="Describe the situation here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Image (Optional)</Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border/50 border-dashed rounded-lg cursor-pointer bg-background/30 hover:bg-background/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                      <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground mx-auto" />
                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Tap to select image</span></p>
                    </div>
                    <input id="image-upload" ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
                {image && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-border/50 relative w-full h-48">
                    <Image 
                      src={image} 
                      alt="Preview" 
                      fill
                      className="object-cover"
                    />
                    <button type="button" onClick={() => setImage(null)} className="absolute top-2 right-2 bg-red-600/90 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-700 transition-colors z-20"><X className="w-4 h-4"/></button>
                  </div>
                )}
              </div>

              <div className="bg-background/30 p-4 rounded-xl border border-border/50 space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2 text-cyan-400">
                    <MapPin className="w-4 h-4" /> Location (Required)
                  </Label>
                  <Button type="button" onClick={getLocation} variant="outline" className="w-full bg-background/50 border-border/50 hover:bg-accent/50 text-foreground">
                    Acquire GPS Signal
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input 
                     type="text" 
                     placeholder="Or triangulate manually..." 
                     value={manualAddress}
                     onChange={(e) => setManualAddress(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         e.preventDefault();
                         getManualLocation();
                       }
                     }}
                     className="bg-background/50 border-border/50 focus-visible:ring-cyan-500"
                  />
                  <Button 
                     type="button" 
                     onClick={getManualLocation}
                     className="bg-cyan-600 hover:bg-cyan-500 text-white shrink-0"
                  >
                     <Search className="w-4 h-4" />
                  </Button>
                </div>
                {locationStatus && (
                  <p className="text-xs text-center mt-2 text-muted-foreground">{locationStatus}</p>
                )}
                {latitude && longitude && (
                  <p className="text-xs text-center mt-1 text-cyan-400">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !latitude || !longitude}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-12 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Transmitting..." : <><Send className="w-4 h-4 mr-2" /> Transmit Report</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
