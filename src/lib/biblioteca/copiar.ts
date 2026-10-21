// Cópia confiável em Chrome e Safari mobile: usa a API moderna quando disponível
// e cai para o método antigo (textarea + execCommand) em contextos sem permissão.
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // segue para o método alternativo
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.opacity = "0";
    area.style.fontSize = "16px"; // evita zoom no iOS
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

export function canShare() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function shareText(
  title: string,
  text: string,
): Promise<"shared" | "cancelled" | "failed"> {
  try {
    await navigator.share({ title, text });
    return "shared";
  } catch (error) {
    return error instanceof DOMException && error.name === "AbortError" ? "cancelled" : "failed";
  }
}
