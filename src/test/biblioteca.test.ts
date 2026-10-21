import { describe, expect, it } from "vitest";
import { categories } from "@/lib/biblioteca/categorias";
import {
  emptyProfile,
  fillText,
  missingFields,
  profileFieldFor,
  valuesFromProfile,
} from "@/lib/biblioteca/campos";
import { library, messageById } from "@/lib/biblioteca/mensagens";
import { normalize, search } from "@/lib/biblioteca/busca";

const allTexts = library.flatMap((message) =>
  message.variants.map((variant) => ({ id: message.id, tone: variant.tone, text: variant.text })),
);

describe("Biblioteca", () => {
  it("tem pelo menos 150 mensagens distintas, distribuídas nas 12 categorias", () => {
    expect(library.length).toBeGreaterThanOrEqual(150);
    expect(categories).toHaveLength(12);
    for (const category of categories) {
      expect(
        library.filter((message) => message.categoryId === category.id).length,
        category.name,
      ).toBeGreaterThanOrEqual(10);
    }
  });

  it("usa IDs únicos e todos os metadados obrigatórios", () => {
    expect(new Set(library.map((message) => message.id)).size).toBe(library.length);
    for (const message of library) {
      expect(message.title, message.id).not.toBe("");
      expect(message.context.length, message.id).toBeGreaterThan(20);
      expect(message.tags.length, message.id).toBeGreaterThanOrEqual(3);
      expect(message.variants.length, message.id).toBeGreaterThanOrEqual(1);
    }
  });

  it("não tem textos de demonstração, curtos ou repetidos", () => {
    const seen = new Map<string, string>();
    for (const { id, text } of allTexts) {
      expect(text.length, id).toBeGreaterThanOrEqual(60);
      expect(text, id).not.toMatch(/lorem|ipsum|mensagem exemplo|texto de demonstra/i);
      const key = normalize(text);
      expect(seen.get(key), `${id} repete ${seen.get(key)}`).toBeUndefined();
      seen.set(key, id);
    }
  });

  it("mantém a linguagem neutra de gênero nos textos", () => {
    for (const { id, text } of allTexts) {
      expect(text, id).not.toMatch(/\bobrigad[oa]s?\b|\bquerid[oa]s?\b|\(a\)|\(o\)|seja bem-vind/i);
    }
  });

  it("não promete resultados nem prescreve", () => {
    for (const { id, text } of allTexts) {
      expect(text, id).not.toMatch(
        /emagre|perder peso|quilos|\d+\s?(mg|g|kg)\b|\bdoses? de\b|garant(o|imos) (o )?resultado/i,
      );
    }
  });

  it("todo campo com cara de perfil corresponde a um campo de Meu perfil", () => {
    const tokens = new Set(library.flatMap((message) => message.fields));
    expect(tokens.has("Nome")).toBe(true);
    for (const token of [
      "Valor",
      "Link de agendamento",
      "Nome profissional",
      "Endereço",
      "Política de cancelamento",
    ]) {
      expect(profileFieldFor(token), token).toBeDefined();
    }
  });
});

describe("Personalização", () => {
  it("preenche campos do perfil e aponta os que faltam, sem inventar", () => {
    const values = valuesFromProfile({
      ...emptyProfile,
      valor: "R$ 250",
      nomeProfissional: "Nutri Ana",
    });
    const text = "Oi, [Nome]! Aqui é [Nome profissional]. A consulta custa [Valor] em [Data].";
    expect(fillText(text, { ...values, Nome: "Bia" })).toBe(
      "Oi, Bia! Aqui é Nutri Ana. A consulta custa R$ 250 em [Data].",
    );
    expect(missingFields(text, values)).toEqual(["Nome", "Data"]);
  });
});

describe("Busca", () => {
  const top = (query: string, count = 5) =>
    search(library, query)
      .slice(0, count)
      .map((result) => result.message.categoryId);

  it.each([
    ["paciente sumiu", "10"],
    ["orçamento", "02"],
    ["orcamento", "02"],
    ["enviar dieta", "06"],
    ["voltar consulta", "09"],
    ["remarcar", "02"],
    ["pagamento", "02"],
    ["pré consulta", "03"],
    ["feedback", "12"],
    ["retorno", "09"],
  ])('"%s" traz a categoria certa entre os primeiros resultados', (query, categoryId) => {
    expect(top(query)).toContain(categoryId);
  });

  it('"não respondeu" encontra mensagens de quem parou de responder', () => {
    const ids = search(library, "não respondeu")
      .slice(0, 8)
      .map((result) => result.message.id);
    expect(ids.some((id) => ["01.08", "02.08", "10.02", "10.06"].includes(id))).toBe(true);
  });

  it("ignora acentos e maiúsculas", () => {
    expect(search(library, "REMARCAÇÃO").length).toBeGreaterThan(0);
    expect(search(library, "Política de cancelamento")[0]?.message.id).toBe(
      messageById("02.19")!.id,
    );
  });
});
