import { ArrowDownLeft, ArrowUpRight, History, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CATEGORIA_LABEL } from "@/lib/constants";
import { formatDateTime, formatQuantidade } from "@/lib/format";
import type { MovimentoComItem, TipoMovimento } from "@/types/item";
import { cn } from "cn";

const TIPO_INFO: Record<
  TipoMovimento,
  { label: string; badge: string }
> = {
  entrada: { label: "Entrada", badge: "text-emerald-700 border-emerald-600/30 bg-emerald-600/10" },
  baixa: { label: "Baixa", badge: "text-destructive" },
  ajuste: { label: "Ajuste", badge: "text-muted-foreground" },
};

function Seta({ tipo }: { tipo: TipoMovimento }) {
  if (tipo === "entrada")
    return <ArrowUpRight className="size-4 text-emerald-600" aria-hidden="true" />;
  if (tipo === "baixa")
    return <ArrowDownLeft className="size-4 text-destructive" aria-hidden="true" />;
  return <Settings2 className="size-4 text-muted-foreground" aria-hidden="true" />;
}

interface MovimentacoesCardProps {
  movimentacoes: MovimentoComItem[];
}

export function MovimentacoesCard({ movimentacoes }: MovimentacoesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-4 text-primary" aria-hidden="true" />
          Últimas movimentações
        </CardTitle>
        <CardAction>
          <Badge variant="outline">Histórico</Badge>
        </CardAction>
        <CardDescription>
          Entradas, baixas e ajustes registrados no estoque.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {movimentacoes.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            Ainda não há movimentações registradas.
          </p>
        ) : (
          <ul className="divide-y">
            {movimentacoes.map((mov) => {
              const info = TIPO_INFO[mov.tipo] ?? TIPO_INFO.ajuste;
              return (
                <li key={mov.id} className="flex items-center gap-3 py-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Seta tipo={mov.tipo} />
                  </span>

                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="truncate text-sm font-medium">
                      {mov.item?.nome ?? "Item removido"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {mov.item
                        ? `${mov.item.codigo} · ${CATEGORIA_LABEL[mov.item.categoria]}`
                        : "Sem vínculo"}{" "}
                      · {formatDateTime(mov.created_at)}
                    </span>
                  </span>

                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold tabular-nums">
                      {mov.tipo === "baixa" ? "−" : "+"}
                      {formatQuantidade(mov.quantidade)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium",
                        info.badge,
                      )}
                    >
                      {info.label}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
