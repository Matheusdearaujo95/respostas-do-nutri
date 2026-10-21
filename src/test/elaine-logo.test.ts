import { afterEach, describe, expect, it, vi } from "vitest";
import { loadElaineLogo } from "../lib/editorial/elaine-logo";

afterEach(() => vi.unstubAllGlobals());

function respond(bytes: number[]) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: async () => new Uint8Array(bytes).buffer,
  }));
}

describe("Carregamento da logo da Elaine", () => {
  it("identifica JPG pelo conteúdo", async () => {
    respond([255, 216, 255, 224]);
    expect((await loadElaineLogo()).format).toBe("jpg");
  });

  it("identifica PNG mesmo quando a URL termina em jpg", async () => {
    respond([137, 80, 78, 71, 13, 10, 26, 10]);
    expect((await loadElaineLogo()).format).toBe("png");
  });

  it("não tenta incorporar HTML recebido no lugar da imagem", async () => {
    respond([60, 104, 116, 109, 108, 62]);
    await expect(loadElaineLogo()).rejects.toThrow(/formato JPG ou PNG válido/);
  });

  it("informa quando a imagem não está disponível", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(loadElaineLogo()).rejects.toThrow(/Não foi possível carregar/);
  });
});
