"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import type { PerfilUsuario } from "@/types/auth";

type Cliente = SupabaseClient<Database>;

interface SessaoContexto {
  supabase: Cliente;
  carregando: boolean;
  usuario: User | null;
  perfil: PerfilUsuario | null;
  sair: () => Promise<void>;
}

const Contexto = createContext<SessaoContexto | null>(null);

/**
 * Sessão via Supabase Auth no navegador. A sessão fica no `localStorage`
 * (storageKey `edcar-sessao`); ao carregar, cruza com `public.profiles`
 * (RLS de dono) para montar o `PerfilUsuario` exposto na UI.
 */
export function SessionProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = useMemo(() => getSupabase(), []);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregarPerfil = useCallback(
    async (user: User): Promise<PerfilUsuario> => {
      const { data: linha } = await supabase
        .from("profiles")
        .select("nome, email, telefone, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
      const nomeMeta =
        typeof metadata.nome === "string" ? metadata.nome.trim() : "";
      const avatarMeta =
        typeof metadata.avatar_url === "string"
          ? metadata.avatar_url.trim()
          : "";
      const email = user.email ?? linha?.email ?? "";

      return {
        id: user.id,
        nome:
          linha?.nome?.trim() ||
          nomeMeta ||
          email.split("@")[0] ||
          "Usuário",
        email: user.email ?? linha?.email ?? "",
        telefone: linha?.telefone ?? null,
        avatarUrl: linha?.avatar_url || avatarMeta || null,
      };
    },
    [supabase],
  );

  useEffect(() => {
    let ativo = true;

    async function sincronizar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!ativo) return;

      if (session?.user) {
        const perfilCarregado = await carregarPerfil(session.user);
        if (!ativo) return;
        setUsuario(session.user);
        setPerfil(perfilCarregado);
      } else {
        setUsuario(null);
        setPerfil(null);
      }
      setCarregando(false);
    }

    void sincronizar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setUsuario(user);
      setPerfil(null);

      if (user) {
        void carregarPerfil(user).then((perfilCarregado) => {
          setPerfil(perfilCarregado);
        });
      }
      setCarregando(false);
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, [supabase, carregarPerfil]);

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const valor = useMemo(
    () => ({ supabase, carregando, usuario, perfil, sair }),
    [supabase, carregando, usuario, perfil, sair],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSessao(): SessaoContexto {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("useSessao deve ser usado dentro de <SessionProvider>.");
  }
  return contexto;
}