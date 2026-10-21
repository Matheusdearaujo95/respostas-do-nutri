import { useState } from "react";
import { elaineLogoUrl } from "../../lib/editorial/elaine-logo";

type BrandProps = {
  variant?: "main" | "horizontal" | "compact" | "icon";
  className?: string;
};

export function ProductIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 88" fill="none" className={className} aria-hidden="true">
      <path d="M19 14h43a10 10 0 0 1 10 10v31a10 10 0 0 1-10 10H37L20 77V65h-1A10 10 0 0 1 9 55V24a10 10 0 0 1 10-10Z" fill="var(--brand-tint)" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M25 31h31M25 41h24M25 51h16" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="69" cy="16" r="9" fill="var(--brand-orange)" stroke="var(--background)" strokeWidth="4" />
    </svg>
  );
}

export function Brand({ variant = "main", className = "" }: BrandProps) {
  return (
    <div className={`product-brand brand-${variant} ${className}`} aria-label="Respostas prontas da Nutri">
      <ProductIcon className="brand-symbol" />
      {variant !== "icon" && (
        <div className="brand-wordmark">
          {variant === "main" ? <><span>Respostas</span><span>prontas</span><span><em>da Nutri</em><i>.</i></span></> : variant === "compact" ? <><span>Respostas prontas</span><span><em>da Nutri</em><i>.</i></span></> : <><span>Respostas</span><span>prontas <em>da Nutri</em><i>.</i></span></>}
        </div>
      )}
    </div>
  );
}

export function ElaineSignature({ className = "" }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  const [src, setSrc] = useState(elaineLogoUrl);
  return <div className={`elaine-signature ${className}`}>
    {failed ? <button type="button" className="elaine-logo-error" onClick={() => { setSrc(`${elaineLogoUrl}&retry=${Date.now()}`); setFailed(false); }}>Logo indisponível. Tentar carregar novamente</button> : <img src={src} alt="Logo da Elaine" width={64} height={64} onError={() => setFailed(true)} />}
    <span>Elaine<small>Comunicação com cuidado</small></span>
  </div>;
}

// Vetor editável; a tipografia permanece texto para atualização futura.
export function logoSvg(variant: "main" | "horizontal" | "compact" | "icon") {
  const iconOnly = variant === "icon";
  const horizontal = variant === "horizontal";
  const compact = variant === "compact";
  const width = iconOnly ? 112 : horizontal ? 700 : compact ? 440 : 460;
  const height = iconOnly ? 112 : horizontal ? 160 : compact ? 150 : 370;
  const x = horizontal ? 135 : 24;
  const y = horizontal ? 65 : compact ? 63 : 205;
  const text = variant === "main"
    ? `<text x="24" y="${y}">Respostas</text><text x="24" y="${y + 62}">prontas</text><text x="24" y="${y + 124}" fill="#3F5C39">da Nutri<tspan fill="#E8562F">.</tspan></text>`
    : compact
      ? `<text x="24" y="63">Respostas prontas</text><text x="24" y="112" fill="#3F5C39">da Nutri<tspan fill="#E8562F">.</tspan></text>`
      : `<text x="${x}" y="${y}">Respostas</text><text x="${x}" y="${y + 58}">prontas <tspan fill="#3F5C39">da Nutri</tspan><tspan fill="#E8562F">.</tspan></text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><title>Respostas prontas da Nutri — ${variant}</title>${compact ? "" : `<g transform="translate(12 12)" fill="none"><path d="M19 14h43a10 10 0 0 1 10 10v31a10 10 0 0 1-10 10H37L20 77V65h-1A10 10 0 0 1 9 55V24a10 10 0 0 1 10-10Z" fill="#EBF0E2" stroke="#3F5C39" stroke-width="2.5" stroke-linejoin="round"/><path d="M25 31h31M25 41h24M25 51h16" stroke="#3F5C39" stroke-width="4.5" stroke-linecap="round"/><circle cx="69" cy="16" r="9" fill="#E8562F" stroke="#FAF9F3" stroke-width="4"/></g>`}${iconOnly ? "" : `<g fill="#1D2A1F" font-family="Bricolage Grotesque, sans-serif" font-size="${compact ? 42 : 56}" font-weight="700" letter-spacing="-2">${text}</g>`}</svg>`;
}
