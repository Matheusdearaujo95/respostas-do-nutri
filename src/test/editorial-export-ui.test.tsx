import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { EditorialStudio } from "../components/editorial/EditorialStudio";

afterEach(cleanup);
beforeEach(() => localStorage.clear());
describe("Área de arquivos finais", () => {
  it("abre a etapa final e exige ciência da revisão antes de gerar", () => {
    render(<EditorialStudio />);
    expect(screen.getByRole("heading", { name: "Seu guia, pronto para conferir." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gerar e conferir PDF" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Gerar DOCX editável" })).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/Entendo que devo revisar/));
    expect(screen.getByRole("button", { name: "Gerar e conferir PDF" })).toBeEnabled();
    expect(screen.getByText("Publicação ainda depende de conferência.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "O que continua clicável no PDF?" })).toBeInTheDocument();
    expect(screen.getByText(/Animações, efeitos ao passar o mouse e controles do estúdio não vão para o PDF/)).toBeInTheDocument();
  });
  it("usa a mesma biblioteca da edição e bloqueia conteúdo incompleto", () => {
    render(<EditorialStudio />);
    fireEvent.click(screen.getByRole("button", { name: "Conteúdo e edição" }));
    fireEvent.change(screen.getByLabelText("A · Profissional"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Arquivos finais" }));
    fireEvent.click(screen.getByLabelText(/Entendo que devo revisar/));
    expect(screen.getByRole("button", { name: "Gerar e conferir PDF" })).toBeDisabled();
    expect(screen.getByText(/alerta\(s\) impedem a exportação/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Conteúdo e edição" }));
    expect(screen.getByLabelText("A · Profissional")).toHaveValue("");
  });
});
