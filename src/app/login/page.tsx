"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsSubmitting(false);
      return setStatus({ type: 'error', msg: "Invalid email or password." });
    }

    const role = data.user?.user_metadata?.role || "volunteer";
    setStatus({ type: 'success', msg: "Login successful! Redirecting..." });
    setTimeout(() => {
      if (email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        router.push("/dashboard/admin");
      } else {
        router.push(`/dashboard/${role}`);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden text-slate-800">
        <div className="bg-emerald-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-emerald-100 text-sm mt-1">Access your relief portal dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {status && <div className={`p-3 rounded text-sm font-medium ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{status.msg}</div>}
          <div><label className="block text-sm font-semibold mb-1 text-slate-700">Email Address</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none" /></div>
          <div><label className="block text-sm font-semibold mb-1 text-slate-700">Password</label><input type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none" /></div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg mt-6 hover:bg-emerald-700 transition-all disabled:opacity-70">{isSubmitting ? "Logging in..." : "Login"}</button>
          
          <div className="text-center text-sm mt-4 text-slate-500">
            Don't have an account? <a href="/register" className="text-emerald-600 font-bold hover:underline">Register</a>
          </div>
        </form>
      </div>
    </div>
  );
}
