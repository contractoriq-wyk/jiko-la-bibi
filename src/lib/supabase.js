import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Will be null if env vars not set yet — app still works, just no sync
export const supabase = url && key ? createClient(url, key) : null;
