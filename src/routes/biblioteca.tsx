import { createFileRoute, Link } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { useMemo } from "react";
import { EmptyState, FooterNote, PageHeader } from "@/components/app/Common";
import { MessageCard } from "@/components/app/MessageCard";
import { SearchBox } from "@/components/app/SearchBox";
import { search, searchSuggestions } from "@/lib/biblioteca/busca";
import { categories, categoryBySlug } from "@/lib/biblioteca/categorias";
import { useMessages } from "@/lib/biblioteca/hooks";

type LibrarySearch = { q?: string | undefined; categoria?: string | undefined };

export const Route = createFileRoute("/biblioteca")({
  validateSearch: (search: Record<string, unknown>): LibrarySearch => ({
    q: typeof search["q"] === "string" && search["q"].trim() ? search["q"] : undefined,
    categoria:
      typeof search["categoria"] === "string" && categoryBySlug(search["categoria"])
        ? search["categoria"]
        : undefined,
  }),
  head: () => ({ meta: [{ title: "Biblioteca · Respostas do Nutri" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const { q, categoria } = Route.useSearch();
  const messages = useMessages();
  const category = categoria ? categoryBySlug(categoria) : undefined;

  const results = useMemo(() => {
    const pool = category
      ? messages.filter((message) => message.categoryId === category.id)
      : messages;
    if (q) return search(pool, q).map((result) => result.message);
    return [...pool].sort(
      (a, b) => Number(!!b.custom) - Number(!!a.custom) || a.id.localeCompare(b.id),
    );
  }, [messages, q, category]);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Biblioteca"
        title={q ? `Resultados para “${q}”` : "Todas as mensagens"}
        lead={q ? undefined : `${messages.length} mensagens prontas para personalizar e copiar.`}
      />

      <div style={{ marginTop: 18 }}>
        <SearchBox
          initial={q ?? ""}
          live
          autoFocus={!q && !category}
          label="Busque por situação: paciente sumiu, orçamento, retorno…"
        />
      </div>

      <div
        className="chips"
        role="group"
        aria-label="Filtrar por categoria"
        style={{ marginTop: 14 }}
      >
        <Link
          to="/biblioteca"
          search={{ q }}
          className={`chip${!category ? " is-on" : ""}`}
          aria-current={!category ? "true" : undefined}
        >
          Todas
        </Link>
        {categories.map((item) => (
          <Link
            key={item.id}
            to="/biblioteca"
            search={{ q, categoria: item.slug }}
            className={`chip${category?.id === item.id ? " is-on" : ""}`}
            aria-current={category?.id === item.id ? "true" : undefined}
          >
            <item.icon size={15} aria-hidden="true" />
            {item.short}
          </Link>
        ))}
      </div>

      <p className="result-count" aria-live="polite">
        {results.length === 1 ? "1 mensagem encontrada" : `${results.length} mensagens encontradas`}
        {category ? ` em ${category.name}` : ""}
      </p>

      {results.length ? (
        <div className="msg-list">
          {results.map((message) => (
            <MessageCard key={message.id} message={message} showCategory={!category} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="Nenhuma mensagem encontrada"
          action={
            <div className="quick" style={{ justifyContent: "center" }}>
              {searchSuggestions.slice(0, 5).map((suggestion) => (
                <Link key={suggestion} to="/biblioteca" search={{ q: suggestion }} className="chip">
                  {suggestion}
                </Link>
              ))}
            </div>
          }
        >
          Tente outras palavras, como a situação do paciente ou o momento do atendimento
          {category ? ", ou procure em todas as categorias" : ""}. Você também pode criar a sua em
          Minhas mensagens.
        </EmptyState>
      )}

      <FooterNote />
    </div>
  );
}
