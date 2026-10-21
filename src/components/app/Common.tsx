import { Link } from "@tanstack/react-router";
import { ChevronRight, Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { messagesInCategory } from "@/lib/biblioteca/mensagens";
import type { Category } from "@/lib/biblioteca/categorias";
import { useAppState } from "@/lib/biblioteca/store";

export function CategoryCard({
  category,
  featured = false,
}: {
  category: Category;
  featured?: boolean;
}) {
  const { custom } = useAppState();
  const count =
    messagesInCategory(category.id).length +
    custom.filter((item) => item.categoryId === category.id).length;
  const Icon = category.icon;
  return (
    <Link
      to="/categoria/$slug"
      params={{ slug: category.slug }}
      className={`cat-card${featured ? " cat-card--featured" : ""}`}
    >
      <span className="cat-card__icon">
        <Icon size={22} aria-hidden="true" />
      </span>
      <span className="cat-card__name">{category.name}</span>
      <span className="cat-card__desc">{category.description}</span>
      <span className="cat-card__count">{count} mensagens</span>
    </Link>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon size={26} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  crumbs?: { label: string; to: string }[];
}) {
  return (
    <header>
      {crumbs && (
        <nav className="crumbs" aria-label="Você está em">
          {crumbs.map((crumb) => (
            <span key={crumb.to} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Link to={crumb.to}>{crumb.label}</Link>
              <ChevronRight size={14} aria-hidden="true" />
            </span>
          ))}
        </nav>
      )}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="page-title">{title}</h1>
      {lead && <p className="page-lead">{lead}</p>}
    </header>
  );
}

export function FooterNote() {
  return (
    <p className="footer-note">
      <Info size={15} aria-hidden="true" />
      As mensagens são modelos editáveis e devem ser revisadas e adaptadas pela nutricionista antes
      do envio.
    </p>
  );
}
