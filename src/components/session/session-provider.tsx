"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PerfilUsuario } from "@/types/auth";
import { clearToken, getToken, setToken, TOKEN_STORAGE_KEY } from "@/lib/auth/client";

interface SessaoContexto {
  carregando: boolean;
  perfil: PerfilUsuario | null;
  token: string | null;
  definirSessao: (token: string, perfil: PerfilUsuario) => void;
  sair: () => void;
}

const Contexto = createContext<SessaoContexto | null>(null);

export function SessionProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [carregando, setCarregando] = useState(true);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  const validarToken = useCallback(async (t: string): Promise<void> => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!res.ok) {
        clearToken();
        setTokenState(null);
        setPerfil(null);
        return;
      }

      const data = (await res.json()) as { user?: PerfilUsuario };
      if (data.user) setPerfil(data.user);
    } catch {
      clearToken();
      setTokenState(null);
      setPerfil(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    async function iniciar(): Promise<void> {
      const t = getToken();
      if (!ativo) return;

      setTokenState(t);

      if (!t) {
        setCarregando(false);
        return;
      }

      await validarToken(t);
    }

    void iniciar();
    return () => {
      ativo = false;
    };
  }, [validarToken]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === TOKEN_STORAGE_KEY) {
        const novo = e.newValue;
        if (!novo) {
          setTokenState(null);
          setPerfil(null);
          return;
        }
        setTokenState(novo);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const definirSessao = useCallback((novoToken: string, p: PerfilUsuario) => {
    setToken(novoToken);
    setTokenState(novoToken);
    setPerfil(p);
    setCarregando(false);
  }, []);

  const sair = useCallback(() => {
    const atual = getToken();
    clearToken();
    setTokenState(null);
    setPerfil(null);

    if (atual) {
      void fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${atual}` },
      }).catch(() => undefined);
    }
  }, []);

  const valor = useMemo(
    () => ({ carregando, perfil, token, definirSessao, sair }),
    [carregando, perfil, token, definirSessao, sair],
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
