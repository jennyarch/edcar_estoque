import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Cliente Supabase no servidor para operações RLS (Server Actions).
 * O access token vem da sessão em localStorage no navegador e é enviado
 * junto à chamada; aqui ele vira o header `Authorization` — sem cookies,
 * sem refresh de sessão no servidor.
 */
export function criarClienteAutenticado(accessToken: string) {
  const { url, publishableKey } = getSupabaseEnv();

  return createSupabaseClient<Database>(url, publishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}