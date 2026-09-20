import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Palette,
  Megaphone, Settings, LogOut, Store, Menu, X, Bell, ChevronRight, ArrowLeft, ChevronDown, FolderTree,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean };
type NavGroup = { label: string; icon: React.ComponentType<{ className?: string }>; items: NavItem[]; defaultOpen?: boolean };
type NavEntry = NavItem | NavGroup;

const NAV: NavEntry[] = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Produits", icon: Package },
  { to: "/admin/categories", label: "Catégories", icon: FolderTree },
  { to: "/admin/orders", label: "Commandes", icon: ShoppingBag },
  { to: "/admin/customers", label: "Clients", icon: Users },
  { to: "/admin/homepage", label: "Page d'accueil", icon: Palette },
  { to: "/admin/announcement", label: "Bandeau annonce", icon: Megaphone },
  { to: "/admin/settings", label: "Paramètres", icon: Settings },
];

const LABELS: Record<string, string> = {
  admin: "Admin",
  products: "Produits",
  new: "Nouveau",
  categories: "Catégories",
  orders: "Commandes",
  customers: "Clients",
  homepage: "Page d'accueil",
  announcement: "Bandeau annonce",
  settings: "Paramètres",
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newOrders, setNewOrders] = useState(0);

  // Close drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Realtime: new orders bell
  useEffect(() => {
    const ch = supabase
      .channel("admin-orders-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const o = payload.new as { full_name?: string; order_number?: string };
        setNewOrders((n) => n + 1);
        toast.success(`🔔 Nouvelle commande #${o.order_number ?? ""} — ${o.full_name ?? ""}`);
        qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [qc]);

  const crumbs = useBreadcrumbs(pathname);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnecté");
    navigate({ to: "/" });
  };

  return (
    <div className="admin-ui min-h-screen bg-background text-foreground antialiased [font-feature-settings:'ss01','cv11'] [font-family:'Manrope','Inter','SF_Pro_Text',system-ui,sans-serif] text-[15px] leading-relaxed tracking-[-0.005em]">
      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-72 bg-sidebar border-e border-hairline flex flex-col transition-transform md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-5 flex items-center justify-between border-b border-hairline">
          <Link to="/admin" className="font-display text-lg font-extrabold tracking-tight">
            ALPHA<span className="text-accent">.</span>ADMIN
          </Link>
          <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(false)} aria-label="Fermer">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV.map((entry) => (
            "items" in entry ? (
              <NavGroupEl key={entry.label} group={entry} pathname={pathname} />
            ) : (
              <NavLink key={entry.to} item={entry} pathname={pathname} />
            )
          ))}
        </nav>

        <div className="p-3 border-t border-hairline space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5">
            <Store className="size-4" /> Voir la boutique
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5">
            <LogOut className="size-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="md:pl-72">
        {/* Sticky top bar */}
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-hairline">
          <div className="flex items-center gap-2 px-4 md:px-8 h-14">
            <button className="md:hidden -ml-1 p-2 rounded-lg hover:bg-white/5" onClick={() => setMobileOpen(true)} aria-label="Menu">
              <Menu className="size-5" />
            </button>
            <button
              onClick={() => window.history.length > 1 ? window.history.back() : navigate({ to: "/admin" })}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg px-2 py-1.5 hover:bg-white/5"
              aria-label="Retour"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Retour</span>
            </button>

            <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0 flex-1 overflow-hidden">
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />}
                  {c.to && i < crumbs.length - 1 ? (
                    <Link to={c.to} className="text-muted-foreground hover:text-foreground truncate">{c.label}</Link>
                  ) : (
                    <span className={`truncate ${i === crumbs.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{c.label}</span>
                  )}
                </span>
              ))}
            </nav>

            <div className="flex-1 md:hidden" />

            <Link
              to="/admin/orders"
              onClick={() => setNewOrders(0)}
              className="relative p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              {newOrders > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold grid place-items-center">
                  {newOrders > 9 ? "9+" : newOrders}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = item.exact ? pathname === item.to : pathname === item.to;
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-accent/15 text-accent font-semibold" : "text-foreground/80 hover:bg-white/5"}`}
    >
      <item.icon className="size-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function NavGroupEl({ group, pathname }: { group: NavGroup; pathname: string }) {
  const anyActive = group.items.some((i) => pathname === i.to || pathname.startsWith(i.to + "/"));
  const [open, setOpen] = useState(!!group.defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-white/5 ${anyActive ? "text-foreground" : ""}`}
      >
        <group.icon className="size-4 shrink-0" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown className={`size-4 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && (
        <div className="mt-1 ml-4 pl-3 border-l border-hairline space-y-0.5">
          {group.items.map((i) => {
            const active = pathname === i.to;
            return (
              <Link
                key={i.to}
                to={i.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${active ? "text-accent font-semibold bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
              >
                <span className="truncate">{i.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function useBreadcrumbs(pathname: string): { label: string; to?: string }[] {
  return useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    // e.g. ["admin","products","new"]
    const out: { label: string; to?: string }[] = [];
    let acc = "";
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      acc += "/" + p;
      const label = LABELS[p] ?? (looksLikeId(p) ? "Détails" : p);
      out.push({ label, to: looksLikeId(p) ? undefined : acc });
    }
    return out;
  }, [pathname]);
}

function looksLikeId(s: string) {
  return /^[0-9a-f]{8}-/i.test(s) || /^\d+$/.test(s);
}

// Page primitives ────────────────────────────────────────────

export function AdminPage({
  title,
  subtitle,
  actions,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 mb-6 md:mb-8">
        <div className="min-w-0">
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function AdminCard({ children, className = "", padded = true }: { children: React.ReactNode; className?: string; padded?: boolean }) {
  return (
    <div className={`rounded-2xl border border-hairline bg-card ${padded ? "p-5 md:p-6" : ""} ${className}`}>{children}</div>
  );
}

export function AdminSection({ title, subtitle, children, actions }: { title: string; subtitle?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="mb-6">
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function AdminEmpty({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 md:p-14 text-center">
      <p className="font-semibold">{title}</p>
      {children && <p className="text-sm text-muted-foreground mt-2">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Sticky bottom action bar for editors (Save / Cancel). */
export function AdminActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 -mx-4 md:-mx-8 mt-8 border-t border-hairline bg-background/90 backdrop-blur-md px-4 md:px-8 py-3 flex items-center justify-end gap-2 z-20">
      {children}
    </div>
  );
}

export function ConfirmDialog({
  open, title, description, confirmLabel = "Confirmer", danger, onConfirm, onCancel,
}: {
  open: boolean; title: string; description?: string; confirmLabel?: string; danger?: boolean;
  onConfirm: () => void | Promise<void>; onCancel: () => void;
}) {
  const [busy, setBusy] = useState(false);
  if (!open) return null;
  const go = async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } };
  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={onCancel}>
      <div className="bg-card border border-hairline rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mb-6">{description}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-semibold border border-hairline hover:bg-white/5">Annuler</button>
          <button onClick={go} disabled={busy} className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${danger ? "bg-destructive hover:opacity-90" : "bg-accent hover:opacity-90"} disabled:opacity-50`}>
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export const inputCls = "w-full bg-background border border-hairline rounded-lg px-3.5 py-2.5 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors";
export const labelCls = "text-[13px] font-semibold text-foreground/90 block mb-2 tracking-[-0.005em]";
export const btnPrimary = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50";
export const btnSecondary = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-hairline text-sm font-semibold hover:bg-white/5 transition-colors disabled:opacity-50";
export const btnDanger = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-destructive text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50";