"use client";

import { useActionState } from "react";
import { CircleAlert, Info, Loader2, LogIn } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import type { AuthState } from "@/types/actions";

const initialState: AuthState = { error: null, message: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      ) : null}

      {state.message ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{state.message}</span>
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
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogIn className="size-4" aria-hidden="true" />
        )}
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
