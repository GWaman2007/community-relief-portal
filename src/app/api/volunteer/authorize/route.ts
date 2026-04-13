import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    // 1. MERGE FIX: Extracted 'email' from the request
    const { id, name, email, skills } = await req.json();
    if (!id || !name || !skills) return NextResponse.json({ error: "Missing identity" }, { status: 400 });

    // 2. MERGE FIX: Updated the prompt with the strict Trust & Safety rules and the user's email
    const prompt = `You are a strict Trust & Safety HR screener for an emergency disaster relief platform. 
    A user just registered with:
    - Name: '${name}'
    - Email: '${email || "Not provided"}'
    - Skills: [${skills.join(', ')}]. 
    
    RULES:
    1. FLAG as unauthorized if the name or email contains inappropriate, explicit, offensive, or obvious joke/troll content (e.g., "soggyballs", fake joke names).
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

    // Keeping Antigravity's optimized REST fetch endpoint
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

      // Antigravity's clean JSON mapping
      is_authorized = parsed.authorized;
      rejection_reason = parsed.reason || "";
    } catch (e) {
      console.error("Gemini AI call failed:", e);
    }

    // Update the record — always runs, even if Gemini failed
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