import { identity } from "./identity";
import { checkLibrary, libraryCategories, parseLibrary, type Library } from "./library";

export const publication = {
  title: identity.name,
  subtitle: identity.subtitle,
  introduction: "Mais tempo para cuidar, menos tempo procurando palavras. Este guia reúne 80 situações da comunicação cotidiana em nutrição, com três mensagens completas para cada uma. Escolha a situação que representa sua necessidade e o tom que combina com sua forma de atender.",
  instructions: [
    "1. Localize a categoria no índice e escolha a situação pelo título e pelo contexto.",
    "2. Compare os tons: A — Profissional, B — Próxima e C — Acolhedora. São alternativas: escolha apenas uma por envio.",
    "3. Copie a mensagem e substitua todos os campos entre colchetes por informações reais. Não envie o texto sem conferir os campos.",
    "4. [Descrição do atendimento] pode receber condições, instruções ou um acesso ao material conforme o contexto. Para consulta online, use o link real da chamada em [Link de agendamento] quando indicado.",
    "5. Revise valores, datas, horários, prazos e condições antes do envio. Adapte o texto à realidade do atendimento, sem prometer resultados.",
    "6. Orientações clínicas exigem avaliação e revisão por nutricionista. Este material não prescreve dietas, suplementos ou doses e não substitui julgamento profissional.",
    "7. Em retornos e reativações, respeite a autorização, a privacidade e qualquer pedido de não contato. Não insista após uma recusa.",
    "8. No PDF, clique nas categorias do índice ou em Voltar ao índice. No DOCX, edite os textos livremente; a paginação pode variar conforme o editor.",
  ],
  closing: "A melhor mensagem é aquela que respeita a pessoa, o contexto e o seu jeito de cuidar. Use este repertório como ponto de partida, personalize com atenção e mantenha as informações atualizadas. Comunicação clara também faz parte do cuidado.",
};
export function exportSnapshot(library: Library): Library {
  const snapshot = parseLibrary(JSON.stringify(library));
  const issues = checkLibrary(snapshot);
  const firstIssue = issues[0];
  if (firstIssue) throw new Error(`Revise os ${issues.length} alertas em Conteúdo e edição antes de exportar. Primeiro: ${firstIssue.id} — ${firstIssue.detail}`);
  for (const category of libraryCategories) {
    if (snapshot.situations.filter(item => item.categoryId === category.id).length !== 8) throw new Error("A distribuição deve ser de oito situações por categoria.");
  }
  return snapshot;
}
export function publicationFilename(library: Library, extension: string) {
  const status = library.reviewedIds.length === 80 ? "final" : "para-conferencia";
  return `respostas-prontas-da-nutri-${status}.${extension}`;
}
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
