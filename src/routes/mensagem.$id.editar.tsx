import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, Eye, RotateCcw, Save, Share2, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, FooterNote } from "@/components/app/Common";
import { useCopy } from "@/components/app/CopyFlow";
import { MessageView, pickVariant, ReviewNotices, ToneTabs } from "@/components/app/MessageParts";
import { useToast } from "@/components/app/Toast";
import {
  extractFields,
  fieldLabel,
  fieldPlaceholder,
  fillText,
  missingFields,
  profileFieldFor,
} from "@/lib/biblioteca/campos";
import { canShare, shareText } from "@/lib/biblioteca/copiar";
import { useMessage, useProfileValues } from "@/lib/biblioteca/hooks";
import { tones, type ToneId } from "@/lib/biblioteca/mensagens";
import { actions, useAppState, useHydrated } from "@/lib/biblioteca/store";
import { MessageSquareDashed } from "lucide-react";

export const Route = createFileRoute("/mensagem/$id/editar")({
  validateSearch: (search: Record<string, unknown>): { tom?: ToneId | undefined } => ({
    tom: tones.some((tone) => tone.id === search["tom"]) ? (search["tom"] as ToneId) : undefined,
  }),
  head: () => ({ meta: [{ title: "Personalizar · Respostas do Nutri" }] }),
  component: EditorPage,
});

function EditorPage() {
  const { id } = Route.useParams();
  const { tom } = Route.useSearch();
  const message = useMessage(id);
  const hydrated = useHydrated();
  const { preferredTone } = useAppState();
  const profileValues = useProfileValues();
  const copy = useCopy();
  const toast = useToast();
  const navigate = useNavigate();

  const variant = message ? pickVariant(message, tom ?? preferredTone) : undefined;
  // Tudo aqui é temporário: nada do que é digitado no editor fica salvo,
  // a menos que a nutricionista salve o modelo em Minhas mensagens.
  const [text, setText] = useState(variant?.text ?? "");
  const [local, setLocal] = useState<Record<string, string>>({});
  useEffect(() => setText(variant?.text ?? ""), [variant?.text]);

  if (!message || !variant) {
    if (!hydrated) return <div className="page" aria-busy="true" />;
    return (
      <div className="page page--narrow">
        <EmptyState
          icon={MessageSquareDashed}
          title="Mensagem não encontrada"
          action={
            <Link to="/biblioteca" className="btn btn--primary">
              Ir para a biblioteca
            </Link>
          }
        >
          Ela pode ter sido excluída ou o endereço mudou.
        </EmptyState>
      </div>
    );
  }

  const values: Record<string, string> = { ...profileValues };
  for (const [token, value] of Object.entries(local)) if (value.trim()) values[token] = value;
  const fields = extractFields(text);
  const missing = missingFields(text, values);
  const changed = text !== variant.text;

  const doCopy = () => copy({ message, text, values, tone: variant.tone, inEditor: true });
  const doShare = async () => {
    if (missing.length) return doCopy();
    const result = await shareText(message.title, fillText(text, values));
    if (result === "shared") actions.recordUse(message.id);
    if (result === "failed")
      toast("Não foi possível abrir o compartilhamento. Use Copiar mensagem.");
  };
  const saveAsMine = () => {
    const newId = actions.saveCustom({
      id: message.custom ? message.id : undefined,
      title: message.custom ? message.title : `${message.title} (minha versão)`,
      categoryId: message.categoryId,
      context: message.context,
      text,
      tags: message.tags,
      basedOn: message.custom ? undefined : message.id,
    });
    toast(message.custom ? "Modelo atualizado" : "Salva em Minhas mensagens");
    if (!message.custom) void navigate({ to: "/mensagem/$id", params: { id: newId } });
  };

  return (
    <div className="page has-sticky">
      <nav className="crumbs" aria-label="Você está em">
        <Link to="/mensagem/$id" params={{ id: message.id }}>
          ‹ Voltar para a mensagem
        </Link>
      </nav>
      <p className="eyebrow">Editor de personalização</p>
      <h1 className="page-title">{message.title}</h1>
      <p className="page-lead">
        Preencha os campos, ajuste o texto se quiser e copie. O texto original da biblioteca não
        muda.
      </p>

      <div className="detail" style={{ marginTop: 20 }}>
        <div>
          <ToneTabs
            message={message}
            tone={variant.tone}
            onChange={(next) => {
              actions.setPreferredTone(next);
              void navigate({ to: ".", search: { tom: next }, replace: true });
            }}
          />

          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="texto">Texto da mensagem</label>
            <textarea
              id="texto"
              className="editor-area"
              value={text}
              onChange={(event) => setText(event.target.value)}
              aria-describedby="texto-ajuda"
            />
            <p id="texto-ajuda" className="field__help">
              Os trechos entre colchetes, como [Nome], são trocados pelos campos ao lado. Evite
              escrever dados de saúde do paciente.
            </p>
          </div>
          {changed && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setText(variant.text)}
            >
              <RotateCcw size={15} aria-hidden="true" /> Voltar ao texto original
            </button>
          )}

          <h2 className="panel__title" style={{ marginTop: 22 }}>
            <Eye size={18} aria-hidden="true" /> Como vai ficar
          </h2>
          <MessageView text={text} values={values} />
          <ReviewNotices message={message} missing={missing} />
        </div>

        <aside className="detail__side">
          <div className="panel">
            <h2 className="panel__title">
              <SlidersHorizontal size={18} aria-hidden="true" /> Campos
            </h2>
            <p className="panel__hint">
              {fields.length
                ? "Os dados do seu perfil já vêm preenchidos. O que você digitar aqui vale só para esta cópia."
                : "Esta mensagem não tem campos para preencher."}
            </p>
            <div style={{ marginTop: 14 }}>
              {fields.map((token) => {
                const fromProfile = profileFieldFor(token);
                const value = local[token] ?? profileValues[token] ?? "";
                const isMissing = !value.trim();
                const multiline = fromProfile?.multiline;
                const inputId = `campo-${token.replace(/\W+/g, "-")}`;
                return (
                  <div key={token} className={`field${isMissing ? " is-missing" : ""}`}>
                    <label htmlFor={inputId}>
                      {fieldLabel(token)}
                      {token === "Nome" && <span className="opt">(não fica salvo)</span>}
                    </label>
                    {multiline ? (
                      <textarea
                        id={inputId}
                        value={value}
                        placeholder={fieldPlaceholder(token)}
                        onChange={(event) => setLocal({ ...local, [token]: event.target.value })}
                      />
                    ) : (
                      <input
                        id={inputId}
                        value={value}
                        placeholder={fieldPlaceholder(token)}
                        autoComplete="off"
                        onChange={(event) => setLocal({ ...local, [token]: event.target.value })}
                      />
                    )}
                    {fromProfile && profileValues[token] && local[token] === undefined && (
                      <span className="field__from-profile">Do seu perfil</span>
                    )}
                    {fromProfile && !profileValues[token] && (
                      <span className="field__help">
                        Dica: salve em{" "}
                        <Link to="/perfil" style={{ textDecoration: "underline" }}>
                          Meu perfil
                        </Link>{" "}
                        para não digitar de novo.
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="action-bar">
              <button
                type="button"
                className="btn btn--primary btn--lg btn--block"
                onClick={doCopy}
              >
                <Copy size={19} aria-hidden="true" /> Copiar mensagem
              </button>
              <div className="action-bar__row">
                {hydrated && canShare() && (
                  <button type="button" className="btn btn--ghost" onClick={doShare}>
                    <Share2 size={17} aria-hidden="true" /> Compartilhar
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={saveAsMine}
                  title="Salva o modelo, sem os dados do paciente"
                >
                  <Save size={17} aria-hidden="true" />{" "}
                  {message.custom ? "Salvar modelo" : "Salvar como minha"}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <FooterNote />

      <div className="sticky-actions">
        <button type="button" className="btn btn--primary btn--lg" onClick={doCopy}>
          <Copy size={19} aria-hidden="true" /> Copiar mensagem
        </button>
      </div>
    </div>
  );
}
