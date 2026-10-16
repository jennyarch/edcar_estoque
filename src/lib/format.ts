const brlFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formata um número como moeda brasileira: 1234.5 -> "R$ 1.234,50" */
export function formatBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `R$ ${brlFormatter.format(value)}`;
}

/** Extrai os dígitos e devolve o valor em centavos formatado como BRL. */
export function maskBRL(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  if (!digits) return "";
  const cents = Number(digits) / 100;
  return `R$ ${brlFormatter.format(cents)}`;
}

/** Converte "R$ 1.234,56" em 1234.56 (ou null quando inválido). */
export function parseBRLToNumber(input: string): number | null {
  const cleaned = input
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Apenas dígitos (código, medidas, quantidade). */
export function onlyDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

/** Máscara de telefone pt-BR: (11) 99999-9999 */
export function maskTelefone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  const ddd = digits.slice(0, 2);
  if (digits.length <= 6) return `(${ddd}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${ddd}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${ddd}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return dateFormatter.format(date);
}

export function formatQuantidade(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

/** Escapa curingas do LIKE para a busca ilike do PostgREST. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}
