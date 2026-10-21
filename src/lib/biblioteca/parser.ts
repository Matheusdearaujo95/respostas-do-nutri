import { extractFields, fieldNeedsReview } from "./campos";

// A biblioteca vive em /conteudo/*.md (um arquivo por categoria), versionada no Git.
// Formato de cada mensagem:
//
//   ## 01.09 · Título
//   situacao: quando usar
//   tags: palavra, outra palavra
//   popular: sim            (opcional)
//   confirmar: sim          (opcional; também é detectado pelos campos)
//
//   ### Próxima
//   Texto...

export type ToneId = "proxima" | "acolhedora" | "profissional";
export const tones: { id: ToneId; label: string; hint: string }[] = [
  { id: "proxima", label: "Próxima", hint: "Conversa natural, simples e leve." },
  { id: "acolhedora", label: "Acolhedora", hint: "Escuta, gentileza e respeito ao momento." },
  { id: "profissional", label: "Profissional", hint: "Clareza, objetividade e cordialidade." },
];
const toneByLabel = new Map(tones.map((tone) => [tone.label.toLocaleLowerCase("pt-BR"), tone.id]));

export type Variant = { tone: ToneId; text: string };

export type Message = {
  id: string;
  categoryId: string;
  title: string;
  context: string;
  tags: string[];
  popular: boolean;
  needsReview: boolean;
  fields: string[];
  variants: Variant[];
  custom?: boolean;
};

export function parseCategoryFile(source: string, file = "conteudo"): Message[] {
  const messages: Message[] = [];
  const sections = source.split(/^## /m).slice(1);
  for (const section of sections) {
    const [heading = "", ...rest] = section.split("\n");
    const head = heading.match(/^(\d{2})\.(\d{2}) · (.+)$/) as
      [string, string, string, string] | null;
    if (!head) throw new Error(`${file}: título de mensagem inválido: "${heading}"`);
    const meta: Record<string, string> = {};
    const variants: Variant[] = [];
    let current: { tone: ToneId; lines: string[] } | null = null;
    for (const line of rest) {
      const toneHeading = line.match(/^### (.+)$/) as [string, string] | null;
      if (toneHeading) {
        if (current) variants.push({ tone: current.tone, text: current.lines.join("\n").trim() });
        const tone = toneByLabel.get(toneHeading[1].trim().toLocaleLowerCase("pt-BR"));
        if (!tone)
          throw new Error(`${file} ${head[1]}.${head[2]}: tom desconhecido "${toneHeading[1]}"`);
        current = { tone, lines: [] };
      } else if (current) {
        current.lines.push(line);
      } else {
        const pair = line.match(/^(\w+):\s*(.*)$/) as [string, string, string] | null;
        if (pair) meta[pair[1]] = pair[2].trim();
      }
    }
    if (current) variants.push({ tone: current.tone, text: current.lines.join("\n").trim() });
    const fields = [...new Set(variants.flatMap((variant) => extractFields(variant.text)))];
    messages.push({
      id: `${head[1]}.${head[2]}`,
      categoryId: head[1],
      title: head[3].trim(),
      context: meta["situacao"] ?? "",
      tags: (meta["tags"] ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      popular: meta["popular"] === "sim",
      needsReview: meta["confirmar"] === "sim" || fields.some(fieldNeedsReview),
      fields,
      variants,
    });
  }
  return messages;
}
