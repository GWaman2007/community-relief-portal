import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Missing Auth" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");
    
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { ngo_id } = await req.json();
    if (!ngo_id) return NextResponse.json({ error: "Missing ngo_id" }, { status: 400 });

    const { error } = await supabase.from("ngos").update({ is_authorized: false, status: 'revoked' }).eq("id", ngo_id);
    if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });
    
    return NextResponse.json({ success: true, message: "NGO operating license revoked." });
  } catch(e) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
