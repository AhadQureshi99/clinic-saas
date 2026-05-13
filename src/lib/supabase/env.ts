export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
export const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

export const hasSupabaseEnv =
  Boolean(supabaseUrl) && Boolean(supabasePublishableKey);