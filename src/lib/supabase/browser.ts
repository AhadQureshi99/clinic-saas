import { createClient } from "@supabase/supabase-js";
import { hasSupabaseEnv, supabasePublishableKey, supabaseUrl } from "./env";

let browserClient: ReturnType<typeof createClient> | null = null;

export function createSupabaseBrowserClient() {
  if (!hasSupabaseEnv) {
    throw new Error("Missing Supabase environment variables.");
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabasePublishableKey);
  }

  return browserClient;
}