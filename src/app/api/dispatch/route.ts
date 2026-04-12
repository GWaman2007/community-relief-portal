import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key"
);

const MAPPING_DICT: Record<string, string[]> = {
  "Public Health": ['Medical Doctor', 'Nurse', 'First Aid Certified', 'Mental Health Counselor'],
  "Water & Sanitation": ['Plumber', 'Sanitation Expert', 'Water Purification', 'Manual Labor'],
  "Infrastructure": ['Electrician', 'Carpenter', 'Construction Worker', 'Heavy Machinery Operator'],
  "Food Security": ['Cook/Chef', 'Logistics/Driver', 'Warehouse Staff'],
  "Education": ['Teacher', 'Childcare Provider', 'Translator'],
  "Emergency Relief": ['Search & Rescue', 'Paramedic', 'Crowd Management']
};

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized: Missing identity payload." }, { status: 401 });
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    
    if (authErr || !user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden: Super Admin access required." }, { status: 403 });
    }

    const { report_id, lat, lng, semantic_node, problem_title } = await req.json();

    if (!report_id || !lat || !lng || !semantic_node) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const targetSkills = MAPPING_DICT[semantic_node] || MAPPING_DICT["Emergency Relief"];

    // 1. Fetch matched volunteers within 5km using RPC (intersecting arrays)
    const { data: volunteers, error: rpcError } = await supabase.rpc("get_matched_volunteers", {
      p_lat: lat,
      p_lng: lng,
      p_skills: targetSkills
    });

    if (rpcError) {
      console.error("Dispatch RPC Error:", rpcError);
      return NextResponse.json({ error: "Failed to find matching nearby volunteers in database" }, { status: 500 });
    }

    if (!volunteers || volunteers.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: "No local volunteers found with matching skills." });
    }

    // 2. Insert mapped notifications pushing to inboxes
    const notificationsToInsert = volunteers.map((v: any) => ({
      volunteer_id: v.id,
      report_id: report_id,
      message: `URGENT DISPATCH: You have been matched to an incident 5km nearby: [${problem_title || 'Emergency Issue'}]. Specific required skills matched: ${targetSkills.join(", ")}. Please respond immediately.`
    }));

    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notificationsToInsert);

    if (insertError) {
      console.error("Notification Insert Error:", insertError);
      return NextResponse.json({ error: "Failed to broadcast notifications to inboxes" }, { status: 500 });
    }

    await supabase.from("reports").update({ status: 'dispatched' }).eq("id", report_id);

    return NextResponse.json({ success: true, count: volunteers.length, message: `Dispatch sent to ${volunteers.length} localized volunteers' inboxes!` });

  } catch (error: any) {
    console.error("Dispatch Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
