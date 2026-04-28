import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Missing Auth" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");
    
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const { table, id, state } = await req.json();
    if (!table || !id) return NextResponse.json({ error: "Missing payload" }, { status: 400 });

    const payload: any = { is_authorized: state };
    if (table === 'ngos' || table === 'volunteers') {
      payload.status = state ? 'approved' : 'revoked';
    }

    const { error } = await supabase.from(table).update(payload).eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, state });
  } catch(e) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
