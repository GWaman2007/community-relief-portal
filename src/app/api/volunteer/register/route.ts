import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Vercel Timeout Extension: This keeps the server alive for 60s while waiting for the AI
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { name, skills, latitude, longitude, auth_id } = await req.json();

    // 1. Validate Input
    if (!name || !skills || !latitude || !longitude || skills.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Prepare Data
    const pointStr = `POINT(${longitude} ${latitude})`;
    const insertData: any = { name, skills, latitude, longitude, coordinates: pointStr };
    if (auth_id) insertData.auth_id = auth_id;

    // 3. Save to Supabase (Defaults to 'pending')
    const { data, error } = await supabase
      .from("volunteers")
      .insert(insertData)
      .select();

    if (error) {
      return NextResponse.json({ error: "Failed to register volunteer" }, { status: 500 });
    }

    // 4. AWAIT the AI Gatekeeper Pipeline
    if (data && data[0]) {
      const originStr = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      try {

        // Abort after 30s to prevent infinite hangs
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30000);

        await fetch(`${originStr}/api/volunteer/authorize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: data[0].id, name: data[0].name, skills: data[0].skills }),
          signal: controller.signal
        });

        clearTimeout(timer);
      } catch (e) {
        // We log the error, but don't crash the request. 
        // The volunteer is safe in the DB as 'pending' for manual review.
      }
    }

    // 5. Send Success to Frontend ONLY after AI is done
    return NextResponse.json({ success: true, volunteer: data[0] });

  } catch (error: any) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}