import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Cliente Supabase para Componentes de Cliente.
 * Usado apenas em UI de autenticação quando é necessário ler a sessão
 * no browser — o restante do app busca dados no servidor.
 */
export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();

  return createBrowserClient<Database>(url, publishableKey);
}
