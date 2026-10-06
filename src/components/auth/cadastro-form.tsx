"use client";

import { useActionState, useRef, useState } from "react";
import {
  CircleAlert,
  CircleCheck,
  ImagePlus,
  Loader2,
  UserPlus,
  X,
} from "lucide-react";
import { cadastroAction } from "@/actions/auth";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { erroDoArquivo, processarAvatar } from "@/lib/avatar";
import { AVATAR_MAX_CHARS } from "@/lib/constants";
import { maskTelefone } from "@/lib/format";
import type { AuthState } from "@/types/actions";

const initialState: AuthState = { error: null, message: null };

export function CadastroForm() {
  const [state, formAction, pending] = useActionState(
    cadastroAction,
    initialState,
  );
  const [telefone, setTelefone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [erroAvatar, setErroAvatar] = useState<string | null>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);

  async function selecionarArquivo(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    setErroAvatar(null);

    const erro = erroDoArquivo(arquivo);
    if (erro) {
      setErroAvatar(erro);
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await processarAvatar(arquivo);
      if (dataUrl.length > AVATAR_MAX_CHARS) {
        setErroAvatar("Imagem muito grande. Escolha uma foto menor.");
        event.target.value = "";
        return;
      }
      setAvatar(dataUrl);
    } catch {
      setErroAvatar("Não foi possível processar a imagem.");
      event.target.value = "";
    }
  }

  function removerArquivo() {
    setAvatar(null);
    setErroAvatar(null);
    if (arquivoRef.current) arquivoRef.current.value = "";
  }

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
          className="flex items-start gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400"
        >
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.message}</span>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="nome">Nome completo</Label>
        <Input
          id="nome"
          name="nome"
          autoComplete="name"
          placeholder="Seu nome"
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
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
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            name="telefone"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            value={telefone}
            onChange={(event) => setTelefone(maskTelefone(event.target.value))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar">Foto do perfil (opcional)</Label>
        <div className="flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground ring-1 ring-border">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL não é otimizável pelo next/image
              <img
                src={avatar}
                alt="Pré-visualização da foto de perfil"
                className="size-full object-cover"
              />
            ) : (
              <ImagePlus className="size-6" aria-hidden="true" />
            )}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={arquivoRef}
              id="avatar"
              name="avatar_arquivo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={selecionarArquivo}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => arquivoRef.current?.click()}
            >
              <ImagePlus className="size-3.5" aria-hidden="true" />
              {avatar ? "Trocar foto" : "Escolher imagem"}
            </Button>

            {avatar ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removerArquivo}
              >
                <X className="size-3.5" aria-hidden="true" />
                Remover
              </Button>
            ) : null}
          </div>
        </div>

        <input type="hidden" name="avatar" value={avatar ?? ""} />
        <p
          className={
            erroAvatar
              ? "text-xs font-medium text-destructive"
              : "text-xs text-muted-foreground"
          }
          role={erroAvatar ? "alert" : undefined}
        >
          {erroAvatar ??
            "JPG, PNG ou WebP de até 5 MB — otimizada para 128×128 px."}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <PasswordInput
          id="senha"
          name="senha"
          autoComplete="new-password"
          placeholder="Mínimo de 6 caracteres"
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
          <UserPlus className="size-4" aria-hidden="true" />
        )}
        {pending ? "Criando cadastro..." : "Criar cadastro"}
      </Button>
    </form>
  );
}