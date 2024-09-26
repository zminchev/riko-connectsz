import { createBrowserClient } from "@supabase/ssr";

console.log('asd')
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_KEY || ""
);
