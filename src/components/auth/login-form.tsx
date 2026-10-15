"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Info, Loader2, LogIn } from "lucide-react";
import { PasswordInput } from "@/components/auth/password-input";
import { useSessao } from "@/components/session/session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mapAuthError } from "@/lib/auth-error";
import { firstIssue, loginFormSchema } from "@/lib/validators";

export function LoginForm() {
  const { supabase } = useSessao();
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const valores = {
      email: String(form.get("email") ?? ""),
      senha: String(form.get("senha") ?? ""),
    };

    const parsed = loginFormSchema.safeParse(valores);
    if (!parsed.success) {
      setErro(firstIssue(parsed.error));
      return;
    }

    setErro(null);
    setEnviando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.senha,
    });

    if (error) {
      setEnviando(false);
      setErro(mapAuthError(error.message));
      return;
    }

    setMensagem("Login realizado! Redirecionando...");
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {erro ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{erro}</span>
        </div>
      ) : null}

      {mensagem ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground"
        >
          <Info
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>{mensagem}</span>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="voce@edcar.com.br"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <PasswordInput
          id="senha"
          name="senha"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={enviando}
        aria-busy={enviando}
      >
        {enviando ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogIn className="size-4" aria-hidden="true" />
        )}
        {enviando ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}