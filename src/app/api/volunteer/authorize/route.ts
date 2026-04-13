import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  try {
    const { id, name, skills } = await req.json();
    if (!id || !name || !skills) return NextResponse.json({ error: "Missing identity" }, { status: 400 });

    const prompt = `You are an automated HR screener for a disaster relief platform. A user just registered with the name '${name}' and these skills: [${skills.join(', ')}]. Evaluate if this looks like a legitimate volunteer profile or spam/malicious data. Output strict JSON: { "authorized": boolean, "reason": "short explanation" }.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Gemini Key missing" }, { status: 500 });

    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;
    
    const aiReq = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const aiData = await aiReq.json();
    let is_authorized = false;
    let rejection_reason = "Processing failed.";

    try {
      const rawText = aiData.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(rawText);
      is_authorized = parsed.authorized;
      rejection_reason = parsed.reason || "";
    } catch(e) {
      console.error("Failed parsing AI JSON", e);
    }

    // Update the record natively
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
