import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3 text-center lg:text-left">
        <Logo className="justify-center lg:justify-start" />
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">
            Acesse o sistema
          </h1>
          <p className="text-sm text-muted-foreground">
            Entre com seu e-mail e senha para controlar o estoque da loja.
          </p>
        </div>
      </header>

      <LoginForm />

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem acesso?{" "}
        <Link
          href="/cadastro"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Criar cadastro
        </Link>
      </p>
    </div>
  );
}
