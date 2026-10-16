import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";
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
import type { Item } from "@/types/item";

interface EstoqueBaixoCardProps {
  itens: Item[];
}

export function EstoqueBaixoCard({ itens }: EstoqueBaixoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TriangleAlert className="size-4 text-destructive" aria-hidden="true" />
          Estoque baixo
        </CardTitle>
        <CardAction>
          <Badge variant="destructive">Máx. 2 un.</Badge>
        </CardAction>
        <CardDescription>
          Itens com 2 unidades ou menos — hora de repor.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {itens.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhum item abaixo do limite. Tudo em dia.
          </p>
        ) : (
          <ul className="divide-y">
            {itens.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/estoque/${item.categoria}`}
                  className="group flex items-center gap-3 py-2.5 outline-none"
                >
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="truncate text-sm font-medium group-hover:text-primary group-focus-visible:text-primary">
                      {item.nome}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {item.codigo} · {item.modelo} ·{" "}
                      {CATEGORIA_LABEL[item.categoria]}
                    </span>
                  </span>
                  <Badge
                    variant={item.qtd_estoque === 0 ? "destructive" : "outline"}
                  >
                    {item.qtd_estoque} un.
                  </Badge>
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
