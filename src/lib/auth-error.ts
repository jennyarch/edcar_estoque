/** Traduz mensagens de erro padrão do Supabase Auth para pt-BR. */
export function mapAuthError(message: string): string {
  const text = message.toLowerCase();

  if (text.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (text.includes("already registered"))
    return "Este e-mail já está cadastrado.";
  if (text.includes("email not confirmed"))
    return "Confirme seu e-mail antes de entrar.";
  if (text.includes("rate limit") || text.includes("too many"))
    return "Muitas tentativas. Aguarde alguns instantes e tente novamente.";
  if (text.includes("at least 6"))
    return "A senha deve ter ao menos 6 caracteres.";
  if (text.includes("password")) return "Não foi possível validar a senha.";
  if (text.includes("not found")) return "Usuário não encontrado.";

  return message;
}