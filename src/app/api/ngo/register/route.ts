import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { name, email, auth_id } = await req.json();

    if (!name || !email || !auth_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("ngos")
      .insert({ name, email, auth_id })
      .select();

    if (error) {
      return NextResponse.json({ error: "Failed to register NGO Contributor block." }, { status: 500 });
    }

    return NextResponse.json({ success: true, ngo: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
