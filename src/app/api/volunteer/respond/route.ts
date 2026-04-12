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
    
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { data: vol } = await supabase.from("volunteers").select("is_authorized").eq("auth_id", user.id).single();
    if (!vol || !vol.is_authorized) return NextResponse.json({ error: "Unauthorized: Account Suspended." }, { status: 403 });

    const { notification_id, action } = await req.json();
    if (!notification_id || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: "Invalid payload mapping." }, { status: 400 });
    }

    const { error } = await supabase
      .from("notifications")
      .update({ status: action })
      .eq("id", notification_id);

    if (error) {
      return NextResponse.json({ error: "Failed to update response matrix." }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: action });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
