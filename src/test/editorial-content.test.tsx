import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditorialStudio } from "../components/editorial/EditorialStudio";
import { ContentEditor as Editor } from "../components/editorial/ContentEditor";
import { LibraryProvider } from "../components/editorial/LibraryProvider";
const ContentEditor = () => <LibraryProvider><Editor /></LibraryProvider>;
import { initialSituations, tones } from "../lib/editorial/content";
import { checkLibrary, createLibrary, libraryCategories, libraryStorageKey, parseLibrary, serializeLibrary } from "../lib/editorial/library";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
beforeEach(() => localStorage.clear());

describe("Fonte editorial completa", () => {
  it("contém 80 IDs estáveis, dez categorias e 240 mensagens distintas", () => {
    const library = createLibrary();
    expect(initialSituations).toHaveLength(80);
    expect(new Set(library.situations.map(item => item.id)).size).toBe(80);
    expect(libraryCategories).toHaveLength(10);
    for (const category of libraryCategories) {
      const items = library.situations.filter(item => item.categoryId === category.id);
      expect(items).toHaveLength(8);
      expect(items.map(item => item.id)).toEqual(Array.from({ length: 8 }, (_, index) => `${category.id}.${String(index + 1).padStart(2, "0")}`));
    }
    const texts = library.situations.flatMap(item => tones.map(tone => item.messages[tone.id]));
    expect(texts).toHaveLength(240);
    expect(new Set(texts).size).toBe(240);
    expect(texts.every(text => text.trim().length >= 80)).toBe(true);
    expect(checkLibrary(library)).toEqual([]);
  });
  it("faz ida e volta em JSON preservando acentuação, campos e revisão", () => {
    const library = createLibrary();
    library.situations[0].messages.A = "Olá, [Nome]. Esta é uma atualização da descrição do atendimento, com atenção à comunicação e à revisão profissional.";
    library.reviewedIds = ["01.01"];
    expect(parseLibrary(serializeLibrary(library))).toEqual(library);
    expect(initialSituations.find(item => item.id === "01.01")?.messages.A).not.toBe(library.situations[0].messages.A);
  });
  it("rejeita formato incorreto, IDs duplicados, versões e categorias inválidas", () => {
    expect(() => parseLibrary("não é JSON")).toThrow();
    expect(() => parseLibrary(JSON.stringify({ stage: "Identidade visual" }))).toThrow();
    const duplicate = createLibrary();
    duplicate.situations[1] = duplicate.situations[0];
    expect(() => parseLibrary(JSON.stringify(duplicate))).toThrow();
    const wrongCategory = createLibrary();
    wrongCategory.situations[0].categoryId = "02";
    expect(() => parseLibrary(JSON.stringify(wrongCategory))).toThrow();
    expect(() => parseLibrary(JSON.stringify({ ...createLibrary(), schemaVersion: 2 }))).toThrow();
  });
  it("preserva rascunhos e detecta incompletude, gênero, campos e duplicação", () => {
    const library = createLibrary();
    library.situations[0].title = "";
    library.situations[0].messages = { A: "", B: "Querida [Paciente], obrigada.", C: "Querida [Paciente], obrigada." };
    expect(parseLibrary(serializeLibrary(library))).toEqual(library);
    const issues = checkLibrary(library);
    expect(issues.some(issue => issue.detail.includes("Preencha"))).toBe(true);
    expect(issues.some(issue => issue.detail.includes("gênero"))).toBe(true);
    expect(issues.some(issue => issue.detail.includes("campo não padronizado"))).toBe(true);
    expect(issues.some(issue => issue.detail.includes("repetição literal"))).toBe(true);
  });
});

describe("Biblioteca, edição e armazenamento local", () => {
  it("abre a edição e permite editar os três tons sem alterar IDs", () => {
    render(<EditorialStudio />);
    fireEvent.click(screen.getByRole("button", { name: "Conteúdo e edição" }));
    expect(screen.getByRole("heading", { name: "Cada conversa, um cuidado." })).toBeInTheDocument();
    expect(screen.getByLabelText("A · Profissional")).toBeInTheDocument();
    expect(screen.getByLabelText("B · Próxima")).toBeInTheDocument();
    expect(screen.getByLabelText("C · Acolhedora")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Título da situação"), { target: { value: "Título atualizado" } });
    expect(parseLibrary(localStorage.getItem(libraryStorageKey)!).situations[0].title).toBe("Título atualizado");
    expect(screen.getByRole("heading", { name: "Situação 01.01" })).toBeInTheDocument();
  });
  it("persiste edição, registra revisão e remove a marca após uma mudança", () => {
    const rendered = render(<ContentEditor />);
    fireEvent.click(screen.getByRole("button", { name: "Marcar situação como revisada" }));
    expect(parseLibrary(localStorage.getItem(libraryStorageKey)!).reviewedIds).toEqual(["01.01"]);
    const text = "Olá, [Nome]. Revisei esta mensagem para explicar as informações do atendimento com clareza e acolher as dúvidas que surgirem.";
    fireEvent.change(screen.getByLabelText("A · Profissional"), { target: { value: text } });
    expect(parseLibrary(localStorage.getItem(libraryStorageKey)!).reviewedIds).toEqual([]);
    rendered.unmount();
    render(<ContentEditor />);
    expect(screen.getByLabelText("A · Profissional")).toHaveValue(text);
  });
  it("navega pelas categorias, filtra tons e busca sem acentuação", () => {
    render(<ContentEditor />);
    fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "07" } });
    fireEvent.change(screen.getByLabelText("Buscar no conteúdo"), { target: { value: "suplementos" } });
    expect(screen.getByRole("heading", { name: "Situação 07.05" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Tom de comunicação"), { target: { value: "C" } });
    expect(screen.queryByLabelText("A · Profissional")).not.toBeInTheDocument();
    expect(screen.getByLabelText("C · Acolhedora")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Buscar no conteúdo"), { target: { value: "inexistente-xyz" } });
    expect(screen.getByRole("heading", { name: "Nenhuma situação encontrada" })).toBeInTheDocument();
  });
  it("restaura um JSON válido somente após confirmação e preserva o conteúdo ao cancelar", async () => {
    render(<ContentEditor />);
    const imported = createLibrary();
    imported.situations[0].title = "Título do backup";
    imported.reviewedIds = ["01.01"];
    const file = new File([serializeLibrary(imported)], "backup.json", { type: "application/json" });
    Object.defineProperty(file, "text", { value: async () => serializeLibrary(imported) });
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    fireEvent.change(screen.getByLabelText("Arquivo de backup JSON"), { target: { files: [file] } });
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText("Título da situação")).not.toHaveValue("Título do backup");
    confirm.mockReturnValue(true);
    fireEvent.change(screen.getByLabelText("Arquivo de backup JSON"), { target: { files: [file] } });
    await waitFor(() => expect(screen.getByLabelText("Título da situação")).toHaveValue("Título do backup"));
    expect(parseLibrary(localStorage.getItem(libraryStorageKey)!).reviewedIds).toEqual(["01.01"]);
  });
  it("não sobrescreve um backup local inválido ao recuperar textos-base", () => {
    localStorage.setItem(libraryStorageKey, "arquivo corrompido");
    render(<ContentEditor />);
    expect(screen.getByText(/não será sobrescrito/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Título da situação"), { target: { value: "Alteração em memória" } });
    expect(localStorage.getItem(libraryStorageKey)).toBe("arquivo corrompido");
  });
});
