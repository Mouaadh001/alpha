import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "@fontsource/jetbrains-mono/400.css";
import { supabase } from "@/integrations/supabase/client";
import { CartProvider } from "@/lib/cart";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: "radial-gradient(600px at 50% 30%, rgba(198,255,61,0.15), transparent)" }} />
      <div className="relative max-w-lg text-center">
        <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-lime">// Signal perdu</span>
        <h1 className="mt-6 font-display text-[8rem] leading-none font-black tracking-tighter">
          4<span className="text-lime">0</span>4
        </h1>
        <h2 className="mt-2 text-lg font-bold uppercase tracking-widest">Cette page n'existe pas.</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Elle a peut-être été retirée du catalogue, ou l'URL est incorrecte. Retour à la base.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-lime">Retour à l'accueil</Link>
          <Link to="/cart" className="btn-ghost">Mon panier</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
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
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Alpha Store — Premium Gaming en Algérie" },
      { name: "description", content: "Consoles PlayStation, Xbox, Nintendo, VR, manettes, casques et accessoires gaming premium livrés partout en Algérie." },
      { name: "author", content: "Alpha Store" },
      { name: "theme-color", content: "#0a0a0a" },
      { property: "og:title", content: "Alpha Store — Premium Gaming en Algérie" },
      { property: "og:description", content: "Consoles PlayStation, Xbox, Nintendo, VR, manettes, casques et accessoires gaming premium livrés partout en Algérie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Alpha Store — Premium Gaming en Algérie" },
      { name: "twitter:description", content: "Consoles PlayStation, Xbox, Nintendo, VR, manettes, casques et accessoires gaming premium livrés partout en Algérie." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eee032b2-e275-4e6a-bdf4-245ab7807733/id-preview-563a69dd--082a420a-8950-4408-b3a3-a57e7ecf81b8.lovable.app-1782884049617.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eee032b2-e275-4e6a-bdf4-245ab7807733/id-preview-563a69dd--082a420a-8950-4408-b3a3-a57e7ecf81b8.lovable.app-1782884049617.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <CartProvider>
            <Outlet />
            <Toaster position="bottom-right" />
          </CartProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
