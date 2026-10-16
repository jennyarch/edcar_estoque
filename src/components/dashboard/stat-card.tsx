import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "cn";

interface StatCardProps {
  titulo: string;
  valor: string;
  icone: LucideIcon;
  detalhe?: string;
  tone?: "default" | "alerta";
}

export function StatCard({
  titulo,
  valor,
  icone: Icon,
  detalhe,
  tone = "default",
}: StatCardProps) {
  const alerta = tone === "alerta";

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {titulo}
          </p>
          <p
            className={cn(
              "truncate text-2xl font-bold tracking-tight",
              alerta && "text-destructive",
            )}
          >
            {valor}
          </p>
          {detalhe ? (
            <p className="text-xs text-muted-foreground">{detalhe}</p>
          ) : null}
        </div>

        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            alerta
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}
