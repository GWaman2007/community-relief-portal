import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

// CRITICAL: We MUST use the Service Role Key to access the auth.admin vault
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { id, name, skills } = await req.json();
    if (!id || !name || !skills) return NextResponse.json({ error: "Missing identity" }, { status: 400 });

    // 1. Fetch the auth_id from the volunteer row
    const { data: volData } = await supabase
      .from("volunteers")
      .select("auth_id")
      .eq("id", id)
      .single();

    // 2. Fetch the actual email from Supabase Auth Vault using the auth_id
    let userEmail = "Not provided";
    if (volData?.auth_id) {
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(volData.auth_id);
      if (authData?.user?.email && !authError) {
        userEmail = authData.user.email;
      }
    }

    // 3. The Strict Prompt (Now armed with the secretly fetched email)
    const prompt = `You are a strict Trust & Safety HR screener for an emergency disaster relief platform. 
    A user just registered with:
    - Name: '${name}'
    - Email: '${userEmail}'
    - Skills: [${skills.join(', ')}]. 
    
    RULES:
    1. FLAG as unauthorized if the name OR EMAIL contains inappropriate, explicit, offensive, or obvious joke/troll content (e.g., "soggyballs", fake joke names, obvious throwaway spam addresses).
    2. FLAG as unauthorized if the skills are dangerously conflicting or highly improbable.
    3. APPROVE if it looks like a normal, legitimate volunteer.
    
    Evaluate this profile. Output strict JSON: { "authorized": boolean, "reason": "short explanation" }.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      await supabase.from("volunteers").update({
        is_authorized: false,
        status: 'ai_rejected',
        rejection_reason: "System Error: AI evaluation could not run. Manual review required."
      }).eq("id", id);
      return NextResponse.json({ error: "Gemini Key missing" }, { status: 500 });
    }

    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    let is_authorized = false;
    let rejection_reason = "System Error: AI evaluation timed out or failed. Manual review required.";

    try {
      const aiReq = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const aiData = await aiReq.json();
      const rawText = aiData.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(rawText);

      is_authorized = parsed.authorized;
      rejection_reason = parsed.reason || "";
    } catch (e) {
      console.error("Gemini AI call failed:", e);
    }

    // 4. Update the record
    await supabase.from("volunteers").update({
      is_authorized,
      status: is_authorized ? 'approved' : 'ai_rejected',
      rejection_reason: is_authorized ? null : rejection_reason
    }).eq("id", id);

    return NextResponse.json({ success: true, is_authorized, reason: rejection_reason });
  } catch (error: any) {
    return NextResponse.json({ error: "AI Server Error" }, { status: 500 });
  }
}