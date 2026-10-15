/**
 * Barramento de eventos p/ avisar que o estoque mudou.
 * Usado pelos diálogos de itens após criar/editar/baixar/excluir
 * para que as listas (client-side) recarreguem.
 */

type Ouvinte = () => void;

const ouvintes = new Set<Ouvinte>();

export function aoAtualizarEstoque(ouvinte: Ouvinte): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

export function notificarAtualizacaoEstoque(): void {
  for (const ouvinte of ouvintes) {
    try {
      ouvinte();
    } catch {
      // Ouvinte com erro não deve quebrar os demais.
    }
  }
}