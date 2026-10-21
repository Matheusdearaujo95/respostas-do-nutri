import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  CircleHelp,
  Heart,
  Home,
  Library,
  Menu,
  PenSquare,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { categories } from "@/lib/biblioteca/categorias";
import { messagesInCategory } from "@/lib/biblioteca/mensagens";
import { useAppState } from "@/lib/biblioteca/store";
import { Brand, ElaineSignature } from "./Brand";
import { CopyProvider } from "./CopyFlow";
import { ToastProvider } from "./Toast";

const mainNav = [
  { to: "/", label: "Início", icon: Home, exact: true },
  { to: "/biblioteca", label: "Biblioteca", icon: Library },
  { to: "/favoritas", label: "Favoritas", icon: Heart },
  { to: "/minhas", label: "Minhas mensagens", icon: PenSquare },
  { to: "/perfil", label: "Meu perfil", icon: UserRound },
  { to: "/ajuda", label: "Ajuda", icon: CircleHelp },
] as const;

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const { favorites, custom } = useAppState();
  const counts: Record<string, number> = {
    "/favoritas": favorites.length,
    "/minhas": custom.length,
  };
  return (
    <nav aria-label="Navegação principal">
      {mainNav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="navlink"
          activeOptions={{ exact: "exact" in item, includeSearch: false }}
          onClick={onNavigate}
        >
          <item.icon size={19} aria-hidden="true" />
          {item.label}
          {!!counts[item.to] && <span className="navlink__count">{counts[item.to]}</span>}
        </Link>
      ))}
      <p className="sidebar__label" id="cat-label">
        Categorias
      </p>
      <div role="list" aria-labelledby="cat-label">
        {categories.map((category) => (
          <Link
            key={category.id}
            role="listitem"
            to="/categoria/$slug"
            params={{ slug: category.slug }}
            className="navlink"
            onClick={onNavigate}
          >
            <category.icon size={18} aria-hidden="true" />
            {category.name}
            <span className="navlink__count">
              {messagesInCategory(category.id).length +
                custom.filter((item) => item.categoryId === category.id).length}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    drawerRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      menuButton.current?.focus();
    };
  }, [menuOpen]);

  return (
    <ToastProvider>
      <CopyProvider>
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        <div className="shell">
          <aside className="sidebar" aria-label="Menu lateral">
            <div className="sidebar__top">
              <Brand withSub />
            </div>
            <div className="sidebar__scroll">
              <NavContent />
            </div>
            <div className="sidebar__foot">
              <ElaineSignature />
            </div>
          </aside>

          <div className="main">
            <header className="topbar">
              <div className="topbar__brand">
                <Brand size={34} />
              </div>
              <Link to="/biblioteca" className="icon-btn" aria-label="Buscar mensagens">
                <Search size={21} aria-hidden="true" />
              </Link>
              <button
                ref={menuButton}
                type="button"
                className="icon-btn"
                aria-label="Abrir menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <Menu size={22} aria-hidden="true" />
              </button>
            </header>

            <main
              id="conteudo"
              tabIndex={-1}
              style={{ outline: "none", display: "flex", flexDirection: "column", flex: 1 }}
            >
              {children}
            </main>
          </div>
        </div>

        {menuOpen && (
          <>
            <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />
            <div
              ref={drawerRef}
              className="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="sidebar__top">
                <Brand withSub size={36} />
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Fechar menu"
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={22} aria-hidden="true" />
                </button>
              </div>
              <div className="sidebar__scroll">
                <NavContent onNavigate={() => setMenuOpen(false)} />
              </div>
              <div className="sidebar__foot">
                <ElaineSignature />
              </div>
            </div>
          </>
        )}

        <nav className="tabbar" aria-label="Atalhos">
          <Link to="/" activeOptions={{ exact: true }}>
            <Home size={22} aria-hidden="true" />
            Início
          </Link>
          <Link to="/biblioteca" activeOptions={{ includeSearch: false }}>
            <BookOpen size={22} aria-hidden="true" />
            Biblioteca
          </Link>
          <Link to="/favoritas">
            <Heart size={22} aria-hidden="true" />
            Favoritas
          </Link>
          <Link to="/minhas">
            <PenSquare size={22} aria-hidden="true" />
            Minhas
          </Link>
          <Link to="/perfil">
            <UserRound size={22} aria-hidden="true" />
            Perfil
          </Link>
        </nav>
      </CopyProvider>
    </ToastProvider>
  );
}
