import { Loader2 } from "lucide-react";

export function CarregandoTela() {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className="flex min-h-dvh items-center justify-center"
    >
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
    </div>
  );
}