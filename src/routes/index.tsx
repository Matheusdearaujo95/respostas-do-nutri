import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  Clock3,
  Flame,
  Heart,
  RefreshCcw,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useMemo } from "react";
import { elaineLogo } from "@/components/app/Brand";
import { CategoryCard, FooterNote } from "@/components/app/Common";
import { MessageCard } from "@/components/app/MessageCard";
import { SearchBox } from "@/components/app/SearchBox";
import { profileFields } from "@/lib/biblioteca/campos";
import { categories, categoryById } from "@/lib/biblioteca/categorias";
import { useMessages } from "@/lib/biblioteca/hooks";
import { searchSuggestions } from "@/lib/biblioteca/busca";
import { useAppState } from "@/lib/biblioteca/store";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const shortcuts = [
  { slug: "retornos", label: "Retornos", hint: "Convide para voltar", icon: RefreshCcw },
  {
    slug: "orcamentos-e-agendamentos",
    label: "Orçamentos",
    hint: "Valores e agendamento",
    icon: CalendarCheck,
  },
  { slug: "pos-consulta", label: "Pós-consulta", hint: "Depois do atendimento", icon: Sparkles },
];

function HomePage() {
  const { favorites, usage, profile } = useAppState();
  const messages = useMessages();
  const byId = useMemo(() => new Map(messages.map((message) => [message.id, message])), [messages]);

  const recent = Object.entries(usage)
    .sort((a, b) => b[1].last - a[1].last)
    .map(([id]) => byId.get(id))
    .filter((message) => message !== undefined)
    .slice(0, 4);

  const personalTop = Object.entries(usage)
    .sort((a, b) => b[1].count - a[1].count || b[1].last - a[1].last)
    .map(([id, item]) => ({ message: byId.get(id), count: item.count }))
    .filter((item) => item.message)
    .slice(0, 4);
  const mostUsed =
    personalTop.length >= 3
      ? personalTop
      : messages
          .filter((message) => message.popular)
          .slice(0, 4)
          .map((message) => ({ message, count: 0 }));

  const favoriteMessages = favorites
    .map((id) => byId.get(id))
    .filter((message) => message !== undefined);
  const filledProfile = profileFields.filter((field) => profile[field.key].trim()).length;

  return (
    <div className="page">
      <section className="hero" aria-labelledby="hero-title">
        <img className="hero__mark" src={elaineLogo} alt="" />
        <h1 id="hero-title" className="hero__title">
          Suas mensagens prontas, <em>em um só lugar.</em>
        </h1>
        <p className="hero__lead">
          Encontre a mensagem certa, personalize e envie em segundos. Mais praticidade para cuidar
          dos seus pacientes.
        </p>
        <SearchBox visibleLabel placeholder="Ex.: paciente sumiu" />
        <div className="quick" aria-label="Buscas rápidas">
          {searchSuggestions.slice(0, 6).map((suggestion) => (
            <Link key={suggestion} to="/biblioteca" search={{ q: suggestion }} className="chip">
              {suggestion}
            </Link>
          ))}
        </div>
      </section>

      {filledProfile < 3 && (
        <Link to="/perfil" className="notice notice--info" style={{ marginTop: 16 }}>
          <UserRound size={18} aria-hidden="true" />
          <span>
            <strong>Preencha Meu perfil</strong> uma vez e seu nome, valor, link de agendamento e
            endereço entram sozinhos nas mensagens.
          </span>
        </Link>
      )}

      <section className="section" aria-labelledby="atalhos">
        <h2 id="atalhos" className="sr-only">
          Acesso rápido
        </h2>
        <div className="shortcuts">
          {shortcuts.map((item) => (
            <Link
              key={item.slug}
              to="/categoria/$slug"
              params={{ slug: item.slug }}
              className="shortcut"
            >
              <span className="shortcut__icon">
                <item.icon size={20} aria-hidden="true" />
              </span>
              <span>
                <strong>{item.label}</strong>
                <span>{item.hint}</span>
              </span>
              <ArrowRight className="shortcut__go" size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="section" aria-labelledby="continue">
          <div className="section__head">
            <h2 id="continue" className="section__title">
              <Clock3 size={20} aria-hidden="true" /> Continue de onde parou
            </h2>
          </div>
          <div className="row-list">
            {recent.map((message) => {
              const category = categoryById(message.categoryId);
              const Icon = category?.icon ?? Clock3;
              return (
                <div className="row" key={message.id}>
                  <span className="row__icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div className="row__body">
                    <p className="row__title">
                      <Link to="/mensagem/$id" params={{ id: message.id }}>
                        {message.title}
                      </Link>
                    </p>
                    <p className="row__sub">{category?.name}</p>
                  </div>
                  <ArrowRight size={18} aria-hidden="true" style={{ color: "var(--ink3)" }} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="categorias">
        <div className="section__head">
          <h2 id="categorias" className="section__title">
            Momentos do atendimento
          </h2>
          <Link to="/biblioteca" className="section__link">
            Ver todas
          </Link>
        </div>
        <div className="cat-grid">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              featured={category.slug === "retornos"}
            />
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="mais-usadas">
        <div className="section__head">
          <h2 id="mais-usadas" className="section__title">
            <Flame size={20} aria-hidden="true" /> Mais utilizadas
          </h2>
        </div>
        <div className="scroller">
          {mostUsed.map(({ message, count }) => (
            <MessageCard key={message!.id} message={message!} usedCount={count || undefined} />
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="favoritas">
        <div className="section__head">
          <h2 id="favoritas" className="section__title">
            <Heart size={20} aria-hidden="true" /> Suas favoritas
          </h2>
          {favoriteMessages.length > 0 && (
            <Link to="/favoritas" className="section__link">
              Ver todas ({favoriteMessages.length})
            </Link>
          )}
        </div>
        {favoriteMessages.length ? (
          <div className="scroller">
            {favoriteMessages.slice(0, 4).map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </div>
        ) : (
          <p className="notice notice--info">
            <Heart size={18} aria-hidden="true" />
            <span>
              Toque no coração de uma mensagem para guardá-la aqui e encontrá-la mais rápido.
            </span>
          </p>
        )}
      </section>

      <FooterNote />
    </div>
  );
}
