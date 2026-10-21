import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { EditorialStudio } from "../components/editorial/EditorialStudio";
import { logoSvg } from "../components/editorial/Brand";
import { categories, sampleSituation } from "../lib/editorial/identity";

afterEach(cleanup);
beforeEach(() => localStorage.clear());

describe("Estúdio editorial — aprovação visual", () => {
  const renderPreview = () => {
    render(<EditorialStudio />);
    fireEvent.click(screen.getByRole("button", { name: "Visão geral" }));
  };
  it("preserva a capa e distingue amostra de produto final", () => {
    renderPreview();
    expect(screen.getByRole("heading", { name: "Identidade que conversa." })).toBeInTheDocument();
    expect(screen.getByLabelText("Prévia da capa A4")).toBeInTheDocument();
    expect(screen.getByText("Amostra visual · não é um PDF exportado")).toBeInTheDocument();
  });

  it("navega da amostra de índice até a situação e volta", () => {
    renderPreview();
    fireEvent.click(screen.getByRole("tab", { name: "Índice" }));
    fireEvent.click(screen.getByRole("button", { name: /01 Primeiro contato/ }));
    fireEvent.click(screen.getByRole("button", { name: /Conhecer a situação de amostra/ }));
    expect(screen.getByRole("heading", { name: sampleSituation.title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A Profissional" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "B Próxima" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "C Acolhedora" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Voltar ao índice/ }));
    expect(screen.getByRole("navigation", { name: "Índice da prévia" })).toBeInTheDocument();
  });

  it("registra observações e aprovação apenas no navegador", () => {
    renderPreview();
    fireEvent.click(screen.getByRole("button", { name: "Anotar ajustes" }));
    fireEvent.change(screen.getByLabelText("O que você gostaria de ajustar?"), { target: { value: "Revisar o tamanho do título." } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar observações" }));
    expect(JSON.parse(localStorage.getItem("nutri-visual-v1") || "{}").feedback).toBe("Revisar o tamanho do título.");
    fireEvent.click(screen.getByRole("button", { name: "Aprovar direção visual" }));
    expect(JSON.parse(localStorage.getItem("nutri-visual-v1") || "{}").approved).toBe(true);
  });

  it("apresenta quatro versões da marca e oito cores", () => {
    render(<EditorialStudio />);
    fireEvent.click(screen.getByRole("button", { name: "Identidade visual" }));
    expect(screen.getByRole("button", { name: "Baixar Logotipo principal em SVG" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Baixar Ícone do produto em SVG" })).toBeInTheDocument();
    expect(screen.getByText("#FAF9F3")).toBeInTheDocument();
    expect(categories).toHaveLength(10);
  });

  it("gera SVGs válidos e variações com geometrias distintas", () => {
    const parser = new DOMParser();
    for (const variant of ["main", "horizontal", "compact", "icon"] as const) {
      const svg = parser.parseFromString(logoSvg(variant), "image/svg+xml");
      expect(svg.querySelector("parsererror")).toBeNull();
      expect(svg.documentElement.tagName).toBe("svg");
    }
    expect(logoSvg("compact")).not.toEqual(logoSvg("main"));
    expect(parser.parseFromString(logoSvg("icon"), "image/svg+xml").querySelector("text")).toBeNull();
  });
});
