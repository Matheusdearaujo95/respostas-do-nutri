import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { FooterNote } from "@/components/app/Common";
import { MessageCard } from "@/components/app/MessageCard";
import { categories, categoryBySlug } from "@/lib/biblioteca/categorias";
import { useMessages } from "@/lib/biblioteca/hooks";

export const Route = createFileRoute("/categoria/$slug")({
  loader: ({ params }) => {
    const category = categoryBySlug(params.slug);
    if (!category) throw notFound();
    return { slug: category.slug };
  },
  head: ({ params }) => ({
    meta: [{ title: `${categoryBySlug(params.slug)?.name ?? "Categoria"} · Respostas do Nutri` }],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useLoaderData();
  const category = categoryBySlug(slug)!;
  const messages = useMessages().filter((message) => message.categoryId === category.id);
  const index = categories.findIndex((item) => item.id === category.id);
  const next = categories[(index + 1) % categories.length]!;
  const Icon = category.icon;

  return (
    <div className="page">
      <nav className="crumbs" aria-label="Você está em">
        <Link to="/">Início</Link>
        <span aria-hidden="true">›</span>
        <Link to="/biblioteca">Biblioteca</Link>
      </nav>
      <header className="cat-hero">
        <span className="cat-hero__icon">
          <Icon size={28} aria-hidden="true" />
        </span>
        <div>
          <p className="eyebrow">
            Categoria {category.id} · {messages.length} mensagens
          </p>
          <h1 className="page-title">{category.name}</h1>
          <p className="page-lead">{category.description}</p>
        </div>
      </header>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        <Link
          to="/biblioteca"
          search={{ categoria: category.slug }}
          className="btn btn--secondary btn--sm"
        >
          <Search size={16} aria-hidden="true" /> Buscar nesta categoria
        </Link>
      </div>

      <div className="msg-list" style={{ marginTop: 20 }}>
        {messages.map((message) => (
          <MessageCard key={message.id} message={message} showCategory={false} />
        ))}
      </div>

      <div className="section">
        <Link
          to="/categoria/$slug"
          params={{ slug: next.slug }}
          className="row-list row"
          style={{ display: "flex" }}
        >
          <span className="row__icon">
            <next.icon size={18} aria-hidden="true" />
          </span>
          <span className="row__body">
            <span className="row__sub" style={{ display: "block" }}>
              Próxima categoria
            </span>
            <span className="row__title">{next.name}</span>
          </span>
          <span aria-hidden="true" style={{ color: "var(--olive)", fontWeight: 700 }}>
            →
          </span>
        </Link>
      </div>

      <FooterNote />
    </div>
  );
}
