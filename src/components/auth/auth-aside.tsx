import {
  Boxes,
  ScanSearch,
  TrendingDown,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/logo";

const RECURSOS = [
  {
    icon: Boxes,
    titulo: "Diafragma e peças",
    descricao: "Uma base única, dois estoques sob medida para a loja.",
  },
  {
    icon: ScanSearch,
    titulo: "Consulta rápida",
    descricao: "Busca por nome, código ou modelo em tempo real.",
  },
  {
    icon: TrendingDown,
    titulo: "Baixa com histórico",
    descricao: "Movimentação atômica, com saldo anterior e posterior.",
  },
  {
    icon: ShieldCheck,
    titulo: "Acesso restrito",
    descricao: "Sessão protegida e permissões no banco (RLS).",
  },
] as const;

export function AuthAside() {
  return (
    <aside className="relative hidden overflow-hidden bg-sidebar text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:46px_46px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-24 size-96 rounded-full bg-primary/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="relative">
        <Logo variant="sidebar" />
      </div>

      <div className="relative space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
            Controle de estoque
          </p>
          <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight">
            O estoque da EdCar do jeito que a loja precisa: simples e rápido.
          </h2>
        </div>

        <ul className="grid gap-4">
          {RECURSOS.map(({ icon: Icon, titulo, descricao }) => (
            <li key={titulo} className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="pt-0.5">
                <span className="block text-sm font-semibold">{titulo}</span>
                <span className="block text-sm text-white/60">
                  {descricao}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="grid max-w-md grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-white/60">
              Diafragmas
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold">
              128 <ArrowRight className="size-4 text-white/60" />
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wider text-white/60">
              Peças
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold">
              246 <ArrowRight className="size-4 text-white/60" />
            </p>
          </div>
        </div>
      </div>

      <p className="relative text-xs text-white/50">
        © EdCar Hidrovácuo · Sistema interno
      </p>
    </aside>
  );
}
