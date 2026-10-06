import { z } from "zod";
import type { Categoria, SearchField } from "@/types/item";
import { CATEGORIAS } from "@/types/item";
import { AVATAR_MAX_CHARS, PAGE_SIZES } from "@/lib/constants";
import { parseBRLToNumber } from "@/lib/format";

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos. Revise os campos.";
}

const codigoSchema = z
  .string()
  .trim()
  .min(1, "Informe o código.")
  .regex(/^\d+$/, "O código deve conter apenas números.")
  .max(20, "Máximo de 20 dígitos.");

const nomeSchema = z
  .string()
  .trim()
  .min(1, "Informe o nome.")
  .max(80, "Máximo de 80 caracteres.");

const modeloSchema = z
  .string()
  .trim()
  .min(1, "Informe o modelo.")
  .max(36, "Máximo de 36 caracteres.");

const descricaoSchema = z
  .string()
  .trim()
  .max(50, "Máximo de 50 caracteres.");

const medidasSchema = z
  .string()
  .trim()
  .min(1, "Informe as medidas em mm.")
  .regex(/^\d+$/, "Use apenas números inteiros.")
  .refine((value) => Number(value) >= 1 && Number(value) <= 5000, {
    message: "Medida entre 1 e 5000 mm.",
  });

const qtdEstoqueSchema = z
  .string()
  .trim()
  .min(1, "Informe a quantidade em estoque.")
  .regex(/^\d+$/, "Use apenas números inteiros.")
  .refine((value) => Number(value) <= 999999, {
    message: "Quantidade máxima de 999999.",
  });

const valorObrigatorioSchema = z
  .string()
  .trim()
  .min(1, "Informe o valor unitário.")
  .refine((value) => {
    const parsed = parseBRLToNumber(value);
    return parsed !== null && parsed > 0;
  }, "Informe um valor válido (ex.: R$ 150,00).");

/**
 * Schema do formulário criar/editar.
 * `valor` só é obrigatório (e validado) na categoria "pecas".
 */
export function itemFormSchema(categoria: Categoria) {
  return z.object({
    codigo: codigoSchema,
    nome: nomeSchema,
    modelo: modeloSchema,
    descricao: descricaoSchema,
    medidas: medidasSchema,
    qtd_estoque: qtdEstoqueSchema,
    valor: categoria === "pecas" ? valorObrigatorioSchema : z.string(),
  });
}

export type ItemFormValues = z.infer<ReturnType<typeof itemFormSchema>>;

export const baixaFormSchema = z.object({
  quantidade: z
    .string()
    .trim()
    .min(1, "Informe a quantidade.")
    .regex(/^\d+$/, "Use apenas números inteiros.")
    .refine((value) => Number(value) >= 1, "Mínimo de 1 unidade.")
    .refine((value) => Number(value) <= 999999, "Quantidade muito alta."),
});

export type BaixaFormValues = z.infer<typeof baixaFormSchema>;

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("E-mail inválido."),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const cadastroFormSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "Informe seu nome.")
    .max(80, "Máximo de 80 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("E-mail inválido."),
  telefone: z
    .string()
    .trim()
    .min(1, "Informe o telefone.")
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 11;
    }, "Telefone inválido."),
  avatar: z
    .string()
    .trim()
    .max(AVATAR_MAX_CHARS, "Imagem muito grande. Escolha uma foto menor.")
    .refine(
      (value) =>
        value === "" ||
        /^https?:\/\/\S+$/i.test(value) ||
        /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value),
      "Imagem inválida. Selecione um arquivo JPG, PNG ou WebP.",
    ),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
});

export type CadastroFormValues = z.infer<typeof cadastroFormSchema>;

export const isCategoria = (value: string): value is Categoria =>
  (CATEGORIAS as readonly string[]).includes(value);

/** Leitura segura dos `searchParams` da listagem. */
export const listagemSearchParamsSchema = z.object({
  q: z.string().trim().max(60).optional().catch(undefined),
  campo: z
    .enum(["nome", "codigo", "modelo"])
    .optional()
    .catch("nome" as SearchField),
  pagina: z.coerce.number().int().min(1).max(9999).optional().catch(1),
  tamanho: z.coerce
    .number()
    .int()
    .refine(
      (value) => (PAGE_SIZES as readonly number[]).includes(value),
      "Tamanho inválido",
    )
    .optional()
    .catch(20),
});

export type ListagemSearchParams = z.infer<typeof listagemSearchParamsSchema>;
