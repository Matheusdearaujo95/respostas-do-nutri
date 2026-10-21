import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, CopyPlus, MessageSquareDashed, PencilLine, Share2 } from "lucide-react";
import { useState } from "react";
import { EmptyState, FooterNote } from "@/components/app/Common";
import { useCopy } from "@/components/app/CopyFlow";
import { FavoriteButton, MessageBadges, MessageCard } from "@/components/app/MessageCard";
import { MessageView, pickVariant, ReviewNotices, ToneTabs } from "@/components/app/MessageParts";
import { useToast } from "@/components/app/Toast";
import { fillText, missingFields } from "@/lib/biblioteca/campos";
import { categoryById } from "@/lib/biblioteca/categorias";
import { canShare, shareText } from "@/lib/biblioteca/copiar";
import { useMessage, useMessages, useProfileValues } from "@/lib/biblioteca/hooks";
import type { ToneId } from "@/lib/biblioteca/mensagens";
import { actions, useAppState, useHydrated } from "@/lib/biblioteca/store";

export const Route = createFileRoute("/mensagem/$id/")({
  head: () => ({ meta: [{ title: "Mensagem · Respostas do Nutri" }] }),
  component: MessagePage,
});

function MessagePage() {
  const { id } = Route.useParams();
  const message = useMessage(id);
  const hydrated = useHydrated();
  const { preferredTone } = useAppState();
  const [tone, setTone] = useState<ToneId | null>(null);
  const [patient, setPatient] = useState("");
  const profileValues = useProfileValues();
  const copy = useCopy();
  const toast = useToast();
  const navigate = useNavigate();
  const related = useMessages()
    .filter((item) => message && item.categoryId === message.categoryId && item.id !== message.id)
    .slice(0, 2);

  if (!message) {
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
          Ela pode ter sido excluída de Minhas mensagens ou o endereço mudou.
        </EmptyState>
      </div>
    );
  }

  const variant = pickVariant(message, tone ?? preferredTone);
  const values = { ...profileValues, ...(patient.trim() ? { Nome: patient.trim() } : {}) };
  const missing = missingFields(variant.text, values);
  const category = categoryById(message.categoryId);
  const usesPatientName = message.fields.includes("Nome");

  const doCopy = () => copy({ message, text: variant.text, values, tone: variant.tone });
  const doShare = async () => {
    if (missing.length) return doCopy();
    const result = await shareText(message.title, fillText(variant.text, values));
    if (result === "shared") actions.recordUse(message.id);
    if (result === "failed")
      toast("Não foi possível abrir o compartilhamento. Use Copiar mensagem.");
  };
  const duplicate = () => {
    const newId = actions.saveCustom({
      title: `${message.title} (minha versão)`,
      categoryId: message.categoryId,
      context: message.context,
      text: variant.text,
      tags: message.tags,
      basedOn: message.id,
    });
    toast("Cópia criada em Minhas mensagens");
    void navigate({ to: "/minhas/$id", params: { id: newId } });
  };

  return (
    <div className="page has-sticky">
      <nav className="crumbs" aria-label="Você está em">
        <Link to="/">Início</Link>
        <span aria-hidden="true">›</span>
        {message.custom ? (
          <Link to="/minhas">Minhas mensagens</Link>
        ) : (
          category && (
            <Link to="/categoria/$slug" params={{ slug: category.slug }}>
              {category.name}
            </Link>
          )
        )}
      </nav>

      <div className="detail">
        <div>
          <div className="msg-card__meta">
            <MessageBadges message={message} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <h1 className="page-title" style={{ flex: 1 }}>
              {message.title}
            </h1>
            <FavoriteButton id={message.id} title={message.title} />
          </div>
          {message.context && <p className="page-lead">{message.context}</p>}

          <div style={{ marginTop: 18 }}>
            <ToneTabs
              message={message}
              tone={variant.tone}
              onChange={(next) => {
                setTone(next);
                actions.setPreferredTone(next);
              }}
            />
          </div>

          <MessageView text={variant.text} values={values} id="mensagem-texto" />
          <ReviewNotices message={message} missing={missing} />

          {message.tags.length > 0 && (
            <div className="tags" aria-label="Tags">
              {message.tags.map((tag) => (
                <Link key={tag} to="/biblioteca" search={{ q: tag }} className="tag">
                  #{tag.replace(/\s+/g, "")}
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside className="detail__side">
          <div className="panel">
            {usesPatientName && (
              <div className="field">
                <label htmlFor="paciente">
                  Nome do paciente <span className="opt">(não fica salvo)</span>
                </label>
                <input
                  id="paciente"
                  value={patient}
                  onChange={(event) => setPatient(event.target.value)}
                  placeholder="Ex.: Ana"
                  autoComplete="off"
                  autoCapitalize="words"
                  enterKeyHint="done"
                />
              </div>
            )}
            <div className="action-bar">
              <button
                type="button"
                className="btn btn--primary btn--lg btn--block"
                onClick={doCopy}
              >
                <Copy size={19} aria-hidden="true" /> Copiar mensagem
              </button>
              <Link
                to="/mensagem/$id/editar"
                params={{ id: message.id }}
                search={{ tom: variant.tone }}
                className="btn btn--secondary btn--block"
              >
                <PencilLine size={17} aria-hidden="true" /> Editar antes de copiar
              </Link>
              <div className="action-bar__row">
                {hydrated && canShare() && (
                  <button type="button" className="btn btn--ghost" onClick={doShare}>
                    <Share2 size={17} aria-hidden="true" /> Compartilhar
                  </button>
                )}
                {message.custom ? (
                  <Link to="/minhas/$id" params={{ id: message.id }} className="btn btn--ghost">
                    <PencilLine size={17} aria-hidden="true" /> Editar modelo
                  </Link>
                ) : (
                  <button type="button" className="btn btn--ghost" onClick={duplicate}>
                    <CopyPlus size={17} aria-hidden="true" /> Duplicar
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section" aria-labelledby="relacionadas">
          <div className="section__head">
            <h2 id="relacionadas" className="section__title">
              Na mesma categoria
            </h2>
            {category && (
              <Link
                to="/categoria/$slug"
                params={{ slug: category.slug }}
                className="section__link"
              >
                Ver todas
              </Link>
            )}
          </div>
          <div className="msg-list">
            {related.map((item) => (
              <MessageCard key={item.id} message={item} showCategory={false} />
            ))}
          </div>
        </section>
      )}

      <FooterNote />

      <div className="sticky-actions">
        <Link
          to="/mensagem/$id/editar"
          params={{ id: message.id }}
          search={{ tom: variant.tone }}
          className="btn btn--secondary"
          aria-label="Editar antes de copiar"
        >
          <PencilLine size={18} aria-hidden="true" />
        </Link>
        <button type="button" className="btn btn--primary btn--lg" onClick={doCopy}>
          <Copy size={19} aria-hidden="true" /> Copiar mensagem
        </button>
      </div>
    </div>
  );
}
