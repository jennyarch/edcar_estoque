import type { Metadata } from "next";
import Link from "next/link";
import { CadastroForm } from "@/components/auth/cadastro-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Criar cadastro",
};

export default function CadastroPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3 text-center lg:text-left">
        <Logo className="justify-center lg:justify-start" />
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">
            Criar cadastro
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastre-se para acessar o controle de estoque EdCar.
          </p>
        </div>
      </header>

      <CadastroForm />

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
