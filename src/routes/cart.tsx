import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { useCart } from "@/lib/cart";
import { useI18n, useT } from "@/lib/i18n";
import { formatDA } from "@/lib/format";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Panier — Alpha Store" }] }),
  component: CartPage,
  errorComponent: ({ error }) => <SiteShell><div className="p-12">{(error as Error).message}</div></SiteShell>,
  notFoundComponent: () => <SiteShell><div className="p-12">Introuvable</div></SiteShell>,
});

function CartPage() {
  const cart = useCart();
  const { locale } = useI18n();
  const t = useT();
  const shipping = cart.total > 0 ? 800 : 0;
  return (
    <SiteShell>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16 ">
        <div className="mb-10">
          <span className="eyebrow text-lime">{"\\ VOTRE PANIER"}</span>
          <h1 className="font-display font-bold text-4xl md:text-5xl mt-3 uppercase tracking-tight">{t.cart}</h1>
        </div>
        {cart.items.length === 0 ? (
          <div className="border border-hairline rounded-2xl p-12 md:p-20 text-center bg-surface">
            <div className="size-16 mx-auto mb-6 grid place-items-center rounded-full bg-muted">
              <ShoppingBag className="size-7 text-muted-foreground" />
            </div>
            <p className="text-lg mb-2">{locale === "fr" ? "Votre panier est vide" : "السلة فارغة"}</p>
            <p className="text-sm text-muted-foreground mb-8">{locale === "fr" ? "Découvrez notre sélection de matériel gaming premium." : "اكتشف مجموعتنا من معدات الألعاب الفاخرة."}</p>
            <Link to="/" className="btn-lime">{locale === "fr" ? "Découvrir le catalogue" : "تصفح الكتالوج"}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            <div className="space-y-3">
              {cart.items.map((it) => (
                <div key={it.id} className="flex items-center gap-4 p-3 md:p-4 bg-surface border border-hairline rounded-xl hover:border-muted-foreground/40 transition">
                  <Link to="/product/$slug" params={{ slug: it.slug }} className="size-20 md:size-24 rounded-lg bg-muted shrink-0 overflow-hidden">
                    {it.image_url && <img src={it.image_url} alt={it.name} className="w-full h-full object-contain p-2" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to="/product/$slug" params={{ slug: it.slug }} className="text-sm md:text-base font-medium line-clamp-2 hover:text-lime transition">{it.name}</Link>
                    <div className="text-xs text-muted-foreground font-mono mt-1">{formatDA(it.price_da, locale)}</div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center bg-background border border-hairline rounded-full">
                        <button aria-label="Decrease" onClick={() => cart.setQty(it.id, it.quantity - 1)} className="size-8 grid place-items-center hover:text-lime rounded-full"><Minus className="size-3.5" /></button>
                        <span className="w-8 text-center text-sm font-mono">{it.quantity}</span>
                        <button aria-label="Increase" onClick={() => cart.setQty(it.id, it.quantity + 1)} className="size-8 grid place-items-center hover:text-lime rounded-full"><Plus className="size-3.5" /></button>
                      </div>
                      <button onClick={() => cart.remove(it.id)} aria-label="Remove" className="text-muted-foreground hover:text-destructive text-xs flex items-center gap-1.5 transition">
                        <Trash2 className="size-3.5" /> {locale === "fr" ? "Retirer" : "إزالة"}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm md:text-base font-bold font-mono text-end shrink-0">{formatDA(it.price_da * it.quantity, locale)}</div>
                </div>
              ))}
              <button onClick={cart.clear} className="text-xs text-muted-foreground hover:text-destructive mt-4 font-mono uppercase tracking-widest">
                {locale === "fr" ? "Vider le panier" : "إفراغ السلة"}
              </button>
            </div>

            <aside className="lg:sticky lg:top-24 self-start bg-surface border border-hairline rounded-2xl p-6 md:p-8">
              <span className="eyebrow mb-6 block">{locale === "fr" ? "Récapitulatif" : "الملخص"}</span>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{locale === "fr" ? "Sous-total" : "المجموع الفرعي"}</span>
                  <span className="font-mono">{formatDA(cart.total, locale)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{locale === "fr" ? "Livraison" : "التوصيل"}</span>
                  <span className="font-mono">{formatDA(shipping, locale)}</span>
                </div>
              </div>
              <div className="border-t border-hairline my-5" />
              <div className="flex items-baseline justify-between mb-8">
                <span className="eyebrow">Total</span>
                <span className="text-2xl md:text-3xl font-display font-bold">{formatDA(cart.total + shipping, locale)}</span>
              </div>
              <Link to="/checkout" className="btn-lime w-full">
                {locale === "fr" ? "Passer commande" : "إتمام الطلب"} <ArrowRight className="size-4" />
              </Link>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest text-center mt-4">
                {locale === "fr" ? "Paiement à la livraison" : "الدفع عند الاستلام"}
              </p>
            </aside>
          </div>
        )}
      </div>
    </SiteShell>
  );
}