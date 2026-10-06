import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Cliente Supabase no servidor (Server Components, Server Actions e Route Handlers).
 * A sessão vive nos cookies; as mudanças são aplicadas via `setAll`.
 */
export async function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // cookies() só pode ser escrito em Server Actions / Route Handlers.
          // Em Server Components o refresh é feito no proxy/middleware.
        }
      },
    },
  });
}
