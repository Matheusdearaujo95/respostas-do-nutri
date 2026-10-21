import { categories, identity } from "./identity";
import { initialSituations, tones, type Situation } from "./content";

export const libraryCategories = categories.map((name, index) => ({ id: String(index + 1).padStart(2, "0"), name }));
export const personalizedFields = ["Nome", "Data", "Horário", "Valor", "Nome profissional", "Nome da clínica", "Link de agendamento", "Prazo de entrega", "Descrição do atendimento", "Endereço"];
export const libraryStorageKey = "nutri-editorial-content-v1";
export type Library = { format: "respostas-nutri-editorial"; schemaVersion: 1; situations: Situation[]; reviewedIds: string[] };
export function createLibrary(): Library {
  return { format: "respostas-nutri-editorial", schemaVersion: 1, situations: initialSituations.map(item => ({ ...item, messages: { ...item.messages } })).sort((a, b) => a.id.localeCompare(b.id)), reviewedIds: [] };
}
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === "string" && value.length <= 12000;

// Validação de estrutura aceita rascunhos vazios: o backup também deve preservar trabalho em andamento.
export function parseLibrary(raw: string): Library {
  if (raw.length > 2_000_000) throw new Error("O backup excede o limite de 2 MB.");
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error("O arquivo não contém um JSON válido."); }
  if (!isObject(value) || value.format !== "respostas-nutri-editorial" || value.schemaVersion !== 1 || !Array.isArray(value.situations) || value.situations.length !== 80 || !Array.isArray(value.reviewedIds)) {
    throw new Error("Use um backup editorial versão 1 com as 80 situações. O briefing visual não é um backup de conteúdo.");
  }
  const known = new Map(initialSituations.map(item => [item.id, item.categoryId]));
  const seen = new Set<string>();
  const situations: Situation[] = value.situations.map((item: unknown) => {
    if (!isObject(item) || typeof item.id !== "string" || !known.has(item.id) || seen.has(item.id) || item.categoryId !== known.get(item.id) || !isText(item.title) || !isText(item.context) || !isObject(item.messages)) throw new Error("Há IDs repetidos, categorias incorretas ou campos inválidos no backup.");
    const messages = item.messages;
    if (!isText(messages.A) || !isText(messages.B) || !isText(messages.C)) throw new Error(`A situação ${item.id} precisa dos três campos de mensagem.`);
    seen.add(item.id);
    return { id: item.id, categoryId: known.get(item.id)!, title: item.title, context: item.context, messages: { A: messages.A, B: messages.B, C: messages.C } };
  });
  if (!value.reviewedIds.every(id => typeof id === "string" && known.has(id))) throw new Error("O registro de revisão contém IDs desconhecidos.");
  return { format: "respostas-nutri-editorial", schemaVersion: 1, situations: situations.sort((a, b) => a.id.localeCompare(b.id)), reviewedIds: [...new Set(value.reviewedIds as string[])] };
}

export type EditorialIssue = { id: string; detail: string };
export function checkSituation(item: Situation): EditorialIssue[] {
  const issues: EditorialIssue[] = [];
  if (!item.title.trim() || !item.context.trim()) issues.push({ id: item.id, detail: "Preencha título e contexto." });
  const seen = new Set<string>();
  for (const tone of tones) {
    const text = item.messages[tone.id];
    if (text.trim().length < 80) issues.push({ id: item.id, detail: `Tom ${tone.id}: mensagem incompleta ou muito curta (mínimo de 80 caracteres).` });
    const normalized = text.trim().toLocaleLowerCase("pt-BR").replace(/\s+/g, " ");
    if (seen.has(normalized)) issues.push({ id: item.id, detail: `Tom ${tone.id}: repetição literal de outra versão.` });
    seen.add(normalized);
    if (/\b(querid[oa]s?|obrigad[oa]s?|pront[oa]s?)\b|bem-vind[oa]s?/iu.test(text)) issues.push({ id: item.id, detail: `Tom ${tone.id}: revise expressão potencialmente marcada por gênero.` });
    for (const field of text.matchAll(/\[([^\]]+)\]/g)) {
      if (!personalizedFields.includes(field[1])) issues.push({ id: item.id, detail: `Tom ${tone.id}: campo não padronizado [${field[1]}].` });
    }
    if ((text.match(/\[/g) || []).length !== (text.match(/\]/g) || []).length) issues.push({ id: item.id, detail: `Tom ${tone.id}: colchetes incompletos.` });
  }
  return issues;
}
export function checkLibrary(library: Library): EditorialIssue[] {
  const issues = library.situations.flatMap(checkSituation);
  const texts = new Map<string, string>();
  for (const item of library.situations) for (const tone of tones) {
    const text = item.messages[tone.id].trim().toLocaleLowerCase("pt-BR").replace(/\s+/g, " ");
    const previous = texts.get(text);
    if (text && previous && previous !== item.id) issues.push({ id: item.id, detail: `Tom ${tone.id}: mensagem idêntica à situação ${previous}.` });
    texts.set(text, item.id);
  }
  return issues;
}
export function serializeLibrary(library: Library): string {
  return JSON.stringify({ ...library, exportedAt: new Date().toISOString(), product: { name: identity.name, subtitle: identity.subtitle }, identity, categories: libraryCategories, tones, personalizedFields, reviewNote: "Textos-base com revisão editorial. Validações automáticas não substituem revisão humana nem avaliação clínica por nutricionista." }, null, 2);
}
export function downloadBackup(library: Library) {
  const blob = new Blob([serializeLibrary(library)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `respostas-da-nutri-conteudo-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
