import { categoryById } from "./categorias";
import type { Message } from "./mensagens";

// Busca local, sem IA: ignora acentos e maiúsculas, entende sinônimos comuns
// e procura em título, tags, categoria, situação de uso e texto.

export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const stopwords = new Set([
  "a",
  "o",
  "as",
  "os",
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "um",
  "uma",
  "para",
  "pra",
  "pro",
  "com",
  "que",
  "por",
  "ao",
  "se",
  "me",
  "eu",
  "meu",
  "minha",
  "mensagem",
  "mensagens",
  "msg",
]);

// Cada grupo reúne formas diferentes de pedir a mesma coisa.
const synonymGroups: string[][] = [
  [
    "sumiu",
    "sumida",
    "sumido",
    "desapareceu",
    "sem contato",
    "nao respondeu",
    "nao responde",
    "sem resposta",
    "parou de responder",
    "ghost",
    "reativacao",
    "reativar",
  ],
  ["orcamento", "valor", "valores", "preco", "quanto custa", "custa", "investimento", "caro"],
  ["dieta", "plano alimentar", "cardapio", "plano"],
  ["enviar", "envio", "entrega", "entregar", "mandar"],
  ["voltar", "volta", "retorno", "retornar", "retomar", "nova consulta"],
  [
    "remarcar",
    "remarcacao",
    "reagendar",
    "reagendamento",
    "mudar horario",
    "trocar horario",
    "mudar data",
  ],
  ["pagamento", "pagar", "pix", "cartao", "pago", "comprovante", "parcelamento"],
  ["pre consulta", "preconsulta", "antes da consulta", "lembrete", "vespera"],
  ["feedback", "avaliacao", "opiniao", "experiencia", "depoimento", "satisfacao", "review"],
  ["cancelar", "cancelamento", "desmarcar", "desistir"],
  ["agendar", "marcar", "agendamento", "agenda", "horarios", "disponibilidade"],
  ["duvida", "duvidas", "pergunta", "perguntas"],
  ["obrigado", "obrigada", "agradecer", "agradecimento", "gratidao"],
  ["whatsapp", "zap", "wpp", "whats"],
  ["online", "videochamada", "video", "link", "meet", "zoom"],
  ["oi", "ola", "primeira resposta", "primeiro contato", "saudacao"],
  ["aniversario", "parabens"],
  ["paciente antigo", "ex paciente", "faz tempo"],
  ["pos consulta", "depois da consulta", "apos a consulta"],
  ["acolhimento", "acolher", "apoio", "incentivo", "motivacao"],
  ["critica", "reclamacao", "insatisfacao", "nao gostou"],
  ["material", "materiais", "pdf", "arquivo", "guia", "ebook"],
  ["lista de compras", "mercado", "compras", "feira"],
  ["suplemento", "suplementos", "whey", "vitamina", "creatina"],
  ["ferias", "ausencia", "recesso", "viagem", "feriado"],
].map((group) => group.map(normalize));

type Unit = string[];

function stem(word: string) {
  return word.length > 4 && word.endsWith("s") ? word.slice(0, -1) : word;
}

// Transforma a busca em "unidades": cada unidade precisa aparecer na mensagem,
// por qualquer uma de suas formas.
export function parseQuery(query: string): Unit[] {
  let text = ` ${normalize(query)} `;
  const units: Unit[] = [];
  const phrases = synonymGroups
    .flatMap((group) => group.filter((term) => term.includes(" ")).map((term) => ({ term, group })))
    .sort((a, b) => b.term.length - a.term.length);
  for (const { term, group } of phrases) {
    if (text.includes(` ${term} `)) {
      units.push(group);
      text = text.replace(` ${term} `, " ");
    }
  }
  for (const word of text.split(" ")) {
    if (!word || stopwords.has(word)) continue;
    const group = synonymGroups.find((terms) => terms.includes(word) || terms.includes(stem(word)));
    units.push(group ?? [stem(word)]);
  }
  return units;
}

type Indexed = {
  message: Message;
  title: string;
  tags: string;
  category: string;
  context: string;
  text: string;
};
const weights = { title: 8, tags: 6, category: 4, context: 3, text: 1 } as const;

const cache = new WeakMap<Message, Indexed>();
function indexed(message: Message): Indexed {
  let entry = cache.get(message);
  if (!entry) {
    entry = {
      message,
      title: ` ${normalize(message.title)} `,
      tags: ` ${normalize(message.tags.join(" "))} `,
      category: ` ${normalize(categoryById(message.categoryId)?.name ?? "")} `,
      context: ` ${normalize(message.context)} `,
      text: ` ${normalize(message.variants.map((variant) => variant.text).join(" "))} `,
    };
    cache.set(message, entry);
  }
  return entry;
}

function unitScore(entry: Indexed, unit: Unit) {
  let best = 0;
  for (const term of unit) {
    // Palavras curtas precisam bater inteiras; as demais valem pelo começo da palavra.
    const needle = term.length <= 3 ? ` ${term} ` : ` ${term}`;
    for (const key of Object.keys(weights) as (keyof typeof weights)[]) {
      if (weights[key] > best && entry[key].includes(needle)) best = weights[key];
    }
  }
  return best;
}

export type SearchResult = { message: Message; score: number };

export function search(messages: Message[], query: string): SearchResult[] {
  const units = parseQuery(query);
  if (!units.length) return [];
  const scored = messages.map((message) => {
    const entry = indexed(message);
    const scores = units.map((unit) => unitScore(entry, unit));
    const matched = scores.filter(Boolean).length;
    const total = scores.reduce((sum, value) => sum + value, 0) + (message.popular ? 0.5 : 0);
    return { message, score: total, matched };
  });
  // Primeiro, mensagens que atendem todas as palavras; se nenhuma atender, as que atendem mais.
  const all = scored.filter((item) => item.matched === units.length);
  const pool = all.length
    ? all
    : scored.filter(
        (item) => item.matched > 0 && item.matched >= Math.max(...scored.map((s) => s.matched)),
      );
  return pool
    .sort((a, b) => b.score - a.score || a.message.id.localeCompare(b.message.id))
    .map(({ message, score }) => ({ message, score }));
}

export const searchSuggestions = [
  "paciente sumiu",
  "orçamento",
  "enviar dieta",
  "voltar consulta",
  "remarcar",
  "pagamento",
  "pré consulta",
  "feedback",
  "não respondeu",
  "retorno",
];
