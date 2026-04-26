"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ArrowLeft, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10vh] right-[-10vw] w-[50vw] h-[50vh] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10vh] left-[-10vw] w-[40vw] h-[40vh] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="z-20 absolute top-6 left-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Return to Hub
          </Button>
        </Link>
      </div>

      <div
        className="w-full max-w-md z-10 animate-[slideUp_0.5s_ease-out_both]"
      >
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-[transform,box-shadow] duration-300">
          <CardHeader className="text-center space-y-2 pt-8">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
              <ShieldAlert className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Login</CardTitle>
            <CardDescription className="text-base">
              Sign in to your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {status && (
                <div className={`p-3 rounded-md text-sm font-medium border ${status.type === 'error' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                  {status.msg}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email"
                  type="email" 
                  required 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)} 
                  className="bg-background/50 border-border/50 focus-visible:ring-primary"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passkey</Label>
                <Input 
                  id="password"
                  type="password" 
                  required 
                  minLength={6} 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  className="bg-background/50 border-border/50 focus-visible:ring-emerald-500"
                  placeholder="••••••••"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 mt-4 transition-colors"
              >
                {isSubmitting ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-border/40 py-6">
            <div className="text-sm text-muted-foreground">
              Need an account? <Link href="/register" className="text-primary hover:text-primary font-semibold hover:underline transition-colors">Register</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
