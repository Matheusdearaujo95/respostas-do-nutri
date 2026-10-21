import { Link } from "@tanstack/react-router";
import { ShieldAlert, UserRound } from "lucide-react";
import { fieldLabel, profileFieldFor, splitText, type FieldValues } from "@/lib/biblioteca/campos";
import { tones, type Message, type ToneId } from "@/lib/biblioteca/mensagens";

export function ToneTabs({
  message,
  tone,
  onChange,
}: {
  message: Message;
  tone: ToneId;
  onChange: (tone: ToneId) => void;
}) {
  if (message.variants.length < 2) return null;
  return (
    <div className="tones" role="group" aria-label="Tom da mensagem">
      {message.variants.map((variant) => {
        const info = tones.find((item) => item.id === variant.tone)!;
        return (
          <button
            key={variant.tone}
            type="button"
            aria-pressed={variant.tone === tone}
            title={info.hint}
            onClick={() => onChange(variant.tone)}
          >
            {info.label}
          </button>
        );
      })}
    </div>
  );
}

export function MessageView({
  text,
  values,
  id,
}: {
  text: string;
  values: FieldValues;
  id?: string;
}) {
  return (
    <div className="message-view" id={id}>
      {splitText(text, values).map((part, index) =>
        part.kind === "text" ? (
          <span key={index}>{part.value}</span>
        ) : part.value ? (
          <span key={index} className="f f--filled" title={fieldLabel(part.token)}>
            {part.value}
          </span>
        ) : (
          <span
            key={index}
            className="f f--missing"
            title={`Falta preencher: ${fieldLabel(part.token)}`}
          >
            [{part.token}]
          </span>
        ),
      )}
    </div>
  );
}

export function ReviewNotices({ message, missing }: { message: Message; missing: string[] }) {
  const missingProfile = missing.filter((token) => profileFieldFor(token));
  return (
    <div className="stack-sm" style={{ marginTop: 14 }}>
      {message.needsReview && (
        <p className="notice notice--review">
          <ShieldAlert size={17} aria-hidden="true" />
          <span>
            Esta mensagem traz valores, datas ou condições. Confira se estão corretos antes de
            enviar.
          </span>
        </p>
      )}
      {missingProfile.length > 0 && (
        <p className="notice notice--missing">
          <UserRound size={17} aria-hidden="true" />
          <span>
            Faltam dados do seu perfil: {missingProfile.map(fieldLabel).join(", ")}.{" "}
            <Link to="/perfil" style={{ fontWeight: 700, textDecoration: "underline" }}>
              Preencher Meu perfil
            </Link>
          </span>
        </p>
      )}
    </div>
  );
}

export function pickVariant(message: Message, tone: ToneId | null | undefined) {
  return message.variants.find((variant) => variant.tone === tone) ?? message.variants[0]!;
}
