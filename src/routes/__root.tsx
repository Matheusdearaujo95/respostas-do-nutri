import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "../components/app/AppShell";
import { EmptyState } from "../components/app/Common";

function NotFoundComponent() {
  return (
    <div className="page page--narrow">
      <EmptyState
        icon={SearchX}
        title="Página não encontrada"
        action={
          <Link to="/" className="btn btn--primary">
            Voltar ao início
          </Link>
        }
      >
        O endereço pode ter mudado ou a mensagem foi excluída. Você pode buscar outra mensagem na
        biblioteca.
      </EmptyState>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="page page--narrow">
      <div className="empty">
        <h3>Algo não carregou como deveria</h3>
        <p>
          Tente novamente. Suas favoritas, seu perfil e suas mensagens continuam salvos neste
          aparelho.
        </p>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 16,
          }}
        >
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Tentar novamente
          </button>
          <a href="/" className="btn btn--secondary">
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Respostas do Nutri" },
      {
        name: "description",
        content:
          "Mensagens prontas, editáveis e organizadas para nutricionistas: encontre, personalize e copie em segundos.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { name: "theme-color", content: "#FAF9F3" },
      { name: "color-scheme", content: "light" },
      { property: "og:title", content: "Respostas do Nutri" },
      { property: "og:description", content: "Suas mensagens prontas, em um só lugar." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/brand/respostas-do-nutri-icone.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "apple-touch-icon", href: "/brand/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </AppShell>
    </QueryClientProvider>
  );
}
