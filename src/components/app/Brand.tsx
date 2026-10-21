import { Link } from "@tanstack/react-router";

// Símbolo do Respostas do Nutri: balão de conversa com linhas de texto
// e o ponto papaya, a presença humana em cada mensagem.
export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      className="brand__mark"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M14 10h32a9 9 0 0 1 9 9v21a9 9 0 0 1-9 9H29L16 58v-9h-2a9 9 0 0 1-9-9V19a9 9 0 0 1 9-9Z"
        fill="#EBF0E2"
        stroke="#3F5C39"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M17 24h24M17 31.5h18M17 39h11"
        stroke="#3F5C39"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <circle cx="52" cy="12" r="7" fill="#E8562F" stroke="#FAF9F3" strokeWidth="3.2" />
    </svg>
  );
}

export function Brand({ withSub = false, size = 40 }: { withSub?: boolean; size?: number }) {
  return (
    <Link to="/" className="brand" aria-label="Respostas do Nutri, página inicial">
      <BrandMark size={size} />
      <span>
        <span className="brand__name">
          Respostas <em>do Nutri</em>
          <i>.</i>
        </span>
        {withSub && <span className="brand__sub">Mensagens prontas para pacientes</span>}
      </span>
    </Link>
  );
}

export const elaineLogo = "/brand/elaine-monograma.svg";

export function ElaineSignature({ text = "Curadoria e conteúdo" }: { text?: string }) {
  return (
    <div className="signature">
      <img src={elaineLogo} alt="" width={34} height={49} />
      <span className="signature__text">
        {text}
        <strong>por Elaine</strong>
      </span>
    </div>
  );
}
