import { Link } from "@tanstack/react-router";

// Símbolo oficial do Respostas do Nutri: balão de conversa com o ponto papaya.
export const brandSymbol = "/brand/respostas-do-nutri-simbolo.svg";
export const brandLogo = "/brand/respostas-do-nutri-logo.svg";

export function BrandMark({ size = 40 }: { size?: number }) {
  return <img className="brand__mark" src={brandSymbol} alt="" width={size} height={size} />;
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
export const elaineFullLogo = "/brand/elaine-araujo-nutricionista.svg";

export function ElaineSignature({ text = "Curadoria e conteúdo" }: { text?: string }) {
  return (
    <div className="signature">
      <span className="signature__text">{text}</span>
      <img src={elaineFullLogo} alt="Elaine Araújo, nutricionista" width={128} height={100} />
    </div>
  );
}
