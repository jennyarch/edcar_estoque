import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <PackageSearch className="size-7" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Página não encontrada
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          O endereço que você acessou não existe ou foi movido.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </main>
  );
}
