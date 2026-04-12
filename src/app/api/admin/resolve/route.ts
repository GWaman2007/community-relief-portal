import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Missing identity credentials" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");
    
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden: Super Admin authority strictly required" }, { status: 403 });
    }

    const { report_id } = await req.json();
    if (!report_id) return NextResponse.json({ error: "Missing required payload mappings" }, { status: 400 });

    const { error } = await supabase.from("reports").update({ status: 'resolved' }).eq("id", report_id);
    if (error) return NextResponse.json({ error: "Database mapping pipeline error" }, { status: 500 });
    
    return NextResponse.json({ success: true, message: "Crisis officially marked as closed and resolved." });
  } catch(e) {
    return NextResponse.json({ error: "Fatal Server Exception" }, { status: 500 });
  }
}
