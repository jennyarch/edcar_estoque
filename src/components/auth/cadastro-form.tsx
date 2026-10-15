"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CircleAlert,
  ImagePlus,
  Loader2,
  UserPlus,
  X,
} from "lucide-react";
import { PasswordInput } from "@/components/auth/password-input";
import { useSessao } from "@/components/session/session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { erroDoArquivo, processarAvatar } from "@/lib/avatar";
import { mapAuthError } from "@/lib/auth-error";
import { AVATAR_MAX_CHARS } from "@/lib/constants";
import { maskTelefone } from "@/lib/format";
import {
  cadastroFormSchema,
  firstIssue,
} from "@/lib/validators";

export function CadastroForm() {
  const { supabase } = useSessao();
  const router = useRouter();
  const [telefone, setTelefone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [erroAvatar, setErroAvatar] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const arquivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!sucesso) return;
    const timer = window.setTimeout(() => {
      router.replace("/login");
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [sucesso, router]);

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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const valores = {
      nome: String(form.get("nome") ?? ""),
      email: String(form.get("email") ?? ""),
      telefone: String(form.get("telefone") ?? ""),
      avatar: String(form.get("avatar") ?? ""),
      senha: String(form.get("senha") ?? ""),
    };

    const parsed = cadastroFormSchema.safeParse(valores);
    if (!parsed.success) {
      setErro(firstIssue(parsed.error));
      return;
    }

    setErro(null);
    setEnviando(true);

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.senha,
      options: {
        data: {
          nome: parsed.data.nome,
          full_name: parsed.data.nome,
          telefone: parsed.data.telefone,
          avatar_url: parsed.data.avatar || null,
        },
      },
    });

    if (error) {
      setEnviando(false);
      setErro(mapAuthError(error.message));
      return;
    }

    if (!data.user) {
      setEnviando(false);
      setErro("Não foi possível concluir o cadastro. Tente novamente.");
      return;
    }

    setSucesso(true);
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

      {sucesso ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400"
        >
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>
            Cadastro realizado com sucesso! Redirecionando para o login...
          </span>
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
              disabled={enviando || sucesso}
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
                disabled={enviando || sucesso}
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
        disabled={enviando || sucesso}
        aria-busy={enviando}
      >
        {enviando ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <UserPlus className="size-4" aria-hidden="true" />
        )}
        {enviando ? "Criando cadastro..." : "Criar cadastro"}
      </Button>
    </form>
  );
}