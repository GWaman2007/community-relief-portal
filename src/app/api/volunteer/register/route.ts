import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { name, skills, latitude, longitude, auth_id } = await req.json();

    if (!name || !skills || !latitude || !longitude || skills.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pointStr = `POINT(${longitude} ${latitude})`;
    const insertData: any = { name, skills, latitude, longitude, coordinates: pointStr };
    if (auth_id) insertData.auth_id = auth_id;

    const { data, error } = await supabase
      .from("volunteers")
      .insert(insertData)
      .select();

    if (error) {
      return NextResponse.json({ error: "Failed to register volunteer" }, { status: 500 });
    }

    // Fire & Forget background pipeline to Gemini Authorization Matrix
    if (data && data[0]) {
      const originStr = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      fetch(`${originStr}/api/volunteer/authorize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data[0].id, name: data[0].name, skills: data[0].skills })
      }).catch(e => console.error("Pipeline spawn failed", e));
    }

    return NextResponse.json({ success: true, volunteer: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
