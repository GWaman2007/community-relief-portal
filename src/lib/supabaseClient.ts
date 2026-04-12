import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

declare global {
  var supabase: SupabaseClient | undefined;
}

let supabase: SupabaseClient;

if (!global.supabase) {
  global.supabase = createClient(supabaseUrl, supabaseAnonKey);
}
supabase = global.supabase;

export { supabase };
