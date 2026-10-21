import { Link } from "@tanstack/react-router";
import { Copy, Flame, Heart, PencilLine, ShieldAlert, UserRound } from "lucide-react";
import { categoryById } from "@/lib/biblioteca/categorias";
import { useProfileValues } from "@/lib/biblioteca/hooks";
import { previewOf, type Message } from "@/lib/biblioteca/mensagens";
import { actions, useAppState } from "@/lib/biblioteca/store";
import { useCopy } from "./CopyFlow";
import { pickVariant } from "./MessageParts";

export function FavoriteButton({ id, title }: { id: string; title: string }) {
  const { favorites } = useAppState();
  const on = favorites.includes(id);
  return (
    <button
      type="button"
      className={`fav-btn${on ? " is-on" : ""}`}
      aria-pressed={on}
      aria-label={on ? `Remover "${title}" das favoritas` : `Favoritar "${title}"`}
      title={on ? "Remover das favoritas" : "Favoritar"}
      onClick={() => actions.toggleFavorite(id)}
    >
      <Heart size={20} aria-hidden="true" />
    </button>
  );
}

export function MessageBadges({
  message,
  usedCount,
}: {
  message: Message;
  usedCount?: number | undefined;
}) {
  return (
    <>
      {message.custom && (
        <span className="badge badge--mine">
          <UserRound size={12} aria-hidden="true" /> Minha
        </span>
      )}
      {message.popular && (
        <span className="badge badge--popular">
          <Flame size={12} aria-hidden="true" /> Popular
        </span>
      )}
      {message.needsReview && (
        <span
          className="badge badge--review"
          title="Contém valores, datas ou condições: confira antes de enviar"
        >
          <ShieldAlert size={12} aria-hidden="true" /> Conferir dados
        </span>
      )}
      {!!usedCount && <span>Usada {usedCount}×</span>}
    </>
  );
}

export function MessageCard({
  message,
  showCategory = true,
  usedCount,
}: {
  message: Message;
  showCategory?: boolean;
  usedCount?: number | undefined;
}) {
  const copy = useCopy();
  const values = useProfileValues();
  const { preferredTone } = useAppState();
  const category = categoryById(message.categoryId);
  const variant = pickVariant(message, preferredTone);

  return (
    <article className="msg-card">
      <div className="msg-card__top">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="msg-card__meta">
            {showCategory && category && <span>{category.name}</span>}
            <MessageBadges message={message} usedCount={usedCount} />
          </div>
          <h3 className="msg-card__title">
            <Link to="/mensagem/$id" params={{ id: message.id }}>
              {message.title}
            </Link>
          </h3>
          <p className="msg-card__context">{message.context}</p>
        </div>
      </div>
      <p className="bubble">
        <span className="bubble__text">{previewOf({ ...message, variants: [variant] }, 3)}</span>
      </p>
      {message.tags.length > 0 && (
        <div className="tags" aria-label="Tags">
          {message.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">
              #{tag.replace(/\s+/g, "")}
            </span>
          ))}
        </div>
      )}
      <div className="msg-card__actions">
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => copy({ message, text: variant.text, values, tone: variant.tone })}
        >
          <Copy size={16} aria-hidden="true" /> Copiar
        </button>
        <Link
          to="/mensagem/$id/editar"
          params={{ id: message.id }}
          search={{ tom: variant.tone }}
          className="btn btn--secondary btn--sm"
        >
          <PencilLine size={16} aria-hidden="true" /> Personalizar
        </Link>
        <span className="spacer" />
        <FavoriteButton id={message.id} title={message.title} />
      </div>
    </article>
  );
}
