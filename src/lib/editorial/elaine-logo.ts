// A mesma imagem é usada na tela e nos dois formatos de entrega.
export const elaineLogoUrl = "/images/elaine-logo.jpg?v=2";
export type ElaineLogo = { bytes: Uint8Array; format: "jpg" | "png" };
export const logoUnavailable = "A logo da Elaine não pôde ser carregada. O arquivo foi gerado sem a imagem; confira a logo no estúdio antes de publicar.";

export async function loadElaineLogo(): Promise<ElaineLogo> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(elaineLogoUrl, { cache: "no-cache", signal: controller.signal });
    if (!response.ok) throw new Error("Não foi possível carregar a imagem da Elaine. Confira a logo no estúdio e tente novamente.");
    const bytes = new Uint8Array(await response.arrayBuffer());
    // Detecta o conteúdo real, não apenas a extensão do nome do arquivo.
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { bytes, format: "jpg" };
    if ([137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return { bytes, format: "png" };
    throw new Error("A imagem da Elaine não está em um formato JPG ou PNG válido. Confira o arquivo da logo antes de gerar novamente.");
  } finally {
    clearTimeout(timeout);
  }
}
