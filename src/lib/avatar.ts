/**
 * Utilitários de imagem do cadastro (executa só no navegador).
 * A foto é redimensionada no cliente e enviada como data URL (base64),
 * gravada em `user_metadata.avatar_url` → `public.profiles.avatar_url`.
 */

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"] as const;

const LADO_MAXIMO = 128;
const QUALIDADE_JPEG = 0.72;
const TAMANHO_MAXIMO_ARQUIVO = 5 * 1024 * 1024;

export function ehImagemValida(tipo: string): boolean {
  return (TIPOS_ACEITOS as readonly string[]).includes(tipo);
}

export function erroDoArquivo(arquivo: File): string | null {
  if (!ehImagemValida(arquivo.type)) {
    return "Use uma imagem JPG, PNG ou WebP.";
  }
  if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO) {
    return "A imagem pode ter no máximo 5 MB.";
  }
  return null;
}

/**
 * Converte o arquivo em data URL JPEG de no máximo 128×128,
 * mantendo a proporção. Rejeita quando o arquivo não é legível.
 */
export function processarAvatar(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(arquivo);
    const imagem = new Image();

    const falhar = (erro: Error) => {
      URL.revokeObjectURL(objectUrl);
      reject(erro);
    };

    imagem.onload = () => {
      try {
        const maiorLado = Math.max(
          imagem.naturalWidth,
          imagem.naturalHeight,
        );
        const escala = Math.min(1, LADO_MAXIMO / maiorLado);
        const largura = Math.max(1, Math.round(imagem.naturalWidth * escala));
        const altura = Math.max(1, Math.round(imagem.naturalHeight * escala));

        const canvas = document.createElement("canvas");
        canvas.width = largura;
        canvas.height = altura;

        const contexto = canvas.getContext("2d");
        if (!contexto) {
          falhar(new Error("Não foi possível processar a imagem."));
          return;
        }

        // Fundo branco: JPEG não suporta transparência (PNG/WebP).
        contexto.fillStyle = "#ffffff";
        contexto.fillRect(0, 0, largura, altura);
        contexto.drawImage(imagem, 0, 0, largura, altura);

        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL("image/jpeg", QUALIDADE_JPEG));
      } catch (erro) {
        falhar(erro instanceof Error ? erro : new Error("Imagem inválida."));
      }
    };

    imagem.onerror = () =>
      falhar(new Error("Não foi possível ler o arquivo de imagem."));

    imagem.src = objectUrl;
  });
}
