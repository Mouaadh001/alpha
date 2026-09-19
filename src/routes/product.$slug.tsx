import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { SiteShell } from "@/components/site-shell";
import { productBySlugQO, categoriesQO, productsByCategoryPreviewQO, productFamilyQO } from "@/lib/queries";
import { useI18n, useT } from "@/lib/i18n";
import { formatDA } from "@/lib/format";
import { toast } from "sonner";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import { BackButton } from "@/components/back-button";
import { Minus, Plus, Loader2, ShoppingCart, User, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/lib/errors";
import algeriaData from "../../algeria-data.json";

type AlgeriaCommune = {
  id: string;
  postCode: string;
  nameFr: string;
  nameAr: string;
};

type AlgeriaWilaya = {
  code: string;
  nameFr: string;
  nameAr: string;
  communes: AlgeriaCommune[];
};

const ALGERIA_WILAYAS = algeriaData as AlgeriaWilaya[];

export const Route = createFileRoute("/product/$slug")({
  validateSearch: (s: Record<string, unknown>): { family?: 1 } =>
    s.family === "1" || s.family === 1 ? { family: 1 } : {},
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Alpha Store` },
      { name: "description", content: `Découvrez ${params.slug} sur Alpha Store.` },
    ],
  }),
  loader: async ({ context, params }) => {
    const [product] = await Promise.all([
      context.queryClient.ensureQueryData(productBySlugQO(params.slug)),
      context.queryClient.ensureQueryData(categoriesQO),
    ]);
    if (!product) throw notFound();
    await context.queryClient.ensureQueryData(productsByCategoryPreviewQO(product.category_id));
    if (product.family_key) {
      await context.queryClient.ensureQueryData(productFamilyQO(product.family_key));
    }
    return { product };
  },
  component: ProductPage,
  errorComponent: ({ error }) => <SiteShell><div className="p-12">{error.message}</div></SiteShell>,
  notFoundComponent: () => <SiteShell><div className="p-12">Produit introuvable.</div></SiteShell>,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const loadedProduct = useQuery(productBySlugQO(slug)).data!;
  const search = Route.useSearch();
  const showFamilyPicker = search.family === 1;
  const { locale } = useI18n();
  const t = useT();
  const navigate = useNavigate();
  const { data: categories = [] } = useQuery(categoriesQO);
  const { data: related = [] } = useQuery(productsByCategoryPreviewQO(loadedProduct.category_id));
  const { data: family = [] } = useQuery({
    ...productFamilyQO(loadedProduct.family_key ?? ""),
    enabled: !!loadedProduct.family_key,
  });
  const familySiblings = family.filter((p) => p.family_key === loadedProduct.family_key);

  // Live-switch between family editions without page reload
  const [selectedSiblingId, setSelectedSiblingId] = useState<string | null>(null);
  const product =
    (selectedSiblingId && familySiblings.find((p) => p.id === selectedSiblingId)) || loadedProduct;

  // Intentionally do NOT sync the URL when picking a sibling — updating the
  // URL causes TanStack Router to re-parse the route and drop the family
  // picker. Keep the selection purely in component state.

  const cat = categories.find((c) => c.id === product.category_id);
  const name = locale === "ar" && product.name_ar ? product.name_ar : product.name_fr;
  const description = locale === "ar" && product.description_ar ? product.description_ar : product.description_fr;
  const gallery = (product.images && product.images.length > 0)
    ? product.images
    : (product.image_url ? [product.image_url] : []);

  // Size / storage variants
  const hasVariants = !!(product.storage_option_1 && product.storage_option_2 && product.price_da_option_2);
  const [selectedVariant, setSelectedVariant] = useState<"1" | "2">("1");
  // Reset storage selection when switching editions
  useEffect(() => { setSelectedVariant("1"); }, [product.id]);
  const unitPrice =
    hasVariants && selectedVariant === "2"
      ? (product.price_da_option_2 as number)
      : product.price_da;
  const selectedVariantLabel = hasVariants
    ? (selectedVariant === "2" ? product.storage_option_2! : product.storage_option_1!)
    : null;
  const discountPct = product.compare_at_price_da && product.compare_at_price_da > unitPrice
    ? Math.round(100 - (unitPrice / product.compare_at_price_da) * 100)
    : 0;

  // Direct order form state
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", wilaya: "", commune: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setShowStickyCTA(!entry.isIntersecting),
      { rootMargin: "0px 0px -20% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => firstFieldRef.current?.focus({ preventScroll: true }), 500);
  };

  const schema = z.object({
    full_name: z.string().trim().min(2),
    phone: z.string().trim().min(8).max(20),
    wilaya: z.string().min(1),
    commune: z.string().min(1),
  });
  const subtotal = unitPrice * qty;
  const total = subtotal;
  const selectedWilaya = ALGERIA_WILAYAS.find((wilaya) => wilaya.code === form.wilaya) ?? null;

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || product.stock <= 0) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[String(i.path[0])] = locale === "fr" ? "Champ requis" : "حقل مطلوب"; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const wilaya = ALGERIA_WILAYAS.find((item) => item.code === parsed.data.wilaya);
      const commune = wilaya?.communes.find((item) => item.id === parsed.data.commune);
      if (!wilaya || !commune) throw new Error(locale === "fr" ? "Wilaya et commune requis" : "الولاية والبلدية مطلوبتان");

      const wilayaName = `${wilaya.code} - ${wilaya.nameFr}`;
      const communeName = commune.nameFr;
      const orderId = crypto.randomUUID();
      const { error } = await supabase.from("orders").insert({
        id: orderId,
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        wilaya: wilayaName,
        commune: communeName,
        address: communeName,
        notes: null,
        subtotal_da: subtotal,
        total_da: total,
      });
      if (error) throw error;
      const { error: e2 } = await supabase.from("order_items").insert([{
        order_id: orderId,
        product_id: product.id,
        product_name: selectedVariantLabel ? `${name} — ${selectedVariantLabel}` : name,
        product_slug: product.slug,
        image_url: product.image_url,
        unit_price_da: unitPrice,
        quantity: qty,
        line_total_da: subtotal,
      }]);
      if (e2) throw e2;
      // Fire-and-forget: send admin email (never blocks the user flow)
      supabase.functions.invoke("send-order-email", { body: { order_id: orderId } }).catch(() => {});
      navigate({ to: "/order/$id", params: { id: orderId } });
    } catch (err) {
      toast.error(getErrorMessage(err, locale === "fr" ? "Erreur" : "خطأ"));
      setSubmitting(false);
    }
  };

  const fieldWrapCls = (n: string) =>
    `flex items-center gap-3 w-full h-14 rounded-2xl bg-white border px-4 transition focus-within:border-[#a855f7] focus-within:ring-2 focus-within:ring-[#a855f7]/30 ${errors[n] ? "border-destructive" : "border-neutral-200"}`;
  const inputInner =
    "flex-1 h-full bg-transparent text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none";
  const iconCls = "size-5 text-[#a855f7] shrink-0";

  const outOfStock = product.stock <= 0;

  return (
    <SiteShell>
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 pt-6 pb-24 ">
        <BackButton className="mb-4" />
        {cat && (
          <nav className="eyebrow mb-6 flex gap-2 flex-wrap">
            <Link to="/" className="hover:text-lime">{t.home}</Link><span>/</span>
            <Link to="/category/$slug" params={{ slug: cat.slug }} className="hover:text-lime">
              {locale === "ar" && cat.name_ar ? cat.name_ar : cat.name_fr}
            </Link>
          </nav>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-16 items-start">
          <div className="-mx-4 md:mx-0">
            <ProductGallery images={gallery} alt={name} />
          </div>

          <div className="lg:sticky lg:top-24 flex flex-col">
            {product.brand && <span className="eyebrow mb-3">{product.brand}</span>}
            <h1 className="font-display font-bold text-2xl md:text-4xl uppercase leading-[1.1] tracking-tight mb-4">{name}</h1>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mb-8">
              <span className="text-2xl md:text-3xl font-display font-bold whitespace-nowrap">{formatDA(unitPrice, locale)}</span>
              {discountPct > 0 && (
                <>
                  <span className="text-sm text-muted-foreground line-through">{formatDA(product.compare_at_price_da!, locale)}</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest bg-red text-red-foreground px-2 py-1 rounded">−{discountPct}%</span>
                </>
              )}
            </div>

            {showFamilyPicker && familySiblings.length > 1 && (
              <div className="mb-6">
                <span className="eyebrow mb-3 block">
                  {locale === "fr" ? "Choisissez l'édition" : "اختر الإصدار"}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {familySiblings.map((sibling) => {
                    const sName = locale === "ar" && sibling.name_ar ? sibling.name_ar : sibling.name_fr;
                    // Strip common family prefix so only the distinctive part shows
                    const parentName = locale === "ar" && product.name_ar ? product.name_ar : product.name_fr;
                    const prefix = parentName.split(" ").slice(0, 3).join(" ");
                    const shortLabel = sName.toLowerCase().startsWith(prefix.toLowerCase())
                      ? sName.slice(prefix.length).trim() || sName
                      : sName;
                    const isActive = sibling.id === product.id;
                    return (
                      <button
                        key={sibling.id}
                        type="button"
                        onClick={() => {
                          if (!isActive) setSelectedSiblingId(sibling.id);
                        }}
                        className={`h-16 rounded-2xl border px-3 text-start transition ${
                          isActive
                            ? "border-[#a855f7] bg-[#a855f7]/10 ring-2 ring-[#a855f7]/20"
                            : "border-neutral-700 bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        <span className="block text-sm font-bold truncate">{shortLabel}</span>
                        <span className="block text-xs font-mono opacity-70">{formatDA(sibling.price_da, locale)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {hasVariants && (
              <div className="mb-6">
                <span className="eyebrow mb-3 block">
                  {locale === "fr" ? "Choisissez la taille" : "اختر الحجم"}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: "1" as const, label: product.storage_option_1!, price: product.price_da },
                    { id: "2" as const, label: product.storage_option_2!, price: product.price_da_option_2! },
                  ]).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedVariant(opt.id)}
                      className={`h-16 rounded-2xl border px-4 text-start transition ${
                        selectedVariant === opt.id
                          ? "border-[#a855f7] bg-[#a855f7]/10 ring-2 ring-[#a855f7]/20"
                          : "border-neutral-700 bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="block text-sm font-bold">{opt.label}</span>
                      <span className="block text-xs font-mono opacity-70">{formatDA(opt.price, locale)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Direct order form (Cash on Delivery) */}
            <form ref={formRef} onSubmit={submitOrder} className="rounded-3xl border border-neutral-200 bg-white p-5 md:p-6 text-neutral-900 mb-5">
              {outOfStock ? (
                <div className="rounded-2xl bg-neutral-100 p-5 text-center text-sm font-semibold text-neutral-500">
                  {locale === "fr" ? "Produit en rupture de stock." : "المنتج غير متوفر حالياً."}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight">
                        {locale === "fr" ? "Commander maintenant" : "اطلب الآن"}
                      </h2>
                      <p className="mt-1 text-xs text-neutral-500">
                        {locale === "fr" ? "Paiement à la livraison." : "الدفع عند الاستلام."}
                      </p>
                    </div>
                    <div className="flex h-11 items-center rounded-full border border-neutral-200 bg-neutral-50">
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="grid size-11 place-items-center text-neutral-600 hover:text-neutral-950"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-9 text-center text-sm font-black">{qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                        className="grid size-11 place-items-center text-neutral-600 hover:text-neutral-950"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className={fieldWrapCls("full_name")}>
                    <User className={iconCls} />
                    <input
                      ref={firstFieldRef}
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      className={inputInner}
                      placeholder={locale === "fr" ? "Nom complet" : "الاسم الكامل"}
                      autoComplete="name"
                    />
                  </div>

                  <div className={fieldWrapCls("phone")}>
                    <Phone className={iconCls} />
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={inputInner}
                      placeholder={locale === "fr" ? "Téléphone" : "رقم الهاتف"}
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </div>

                  <div className={fieldWrapCls("wilaya")}>
                    <MapPin className={iconCls} />
                    <select
                      value={form.wilaya}
                      onChange={(e) => setForm({ ...form, wilaya: e.target.value, commune: "" })}
                      className={inputInner}
                    >
                      <option value="">{locale === "fr" ? "Wilaya" : "الولاية"}</option>
                      {ALGERIA_WILAYAS.map((wilaya) => (
                        <option key={wilaya.code} value={wilaya.code}>
                          {wilaya.code} - {locale === "ar" ? wilaya.nameAr : wilaya.nameFr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={fieldWrapCls("commune")}>
                    <MapPin className={iconCls} />
                    <select
                      value={form.commune}
                      onChange={(e) => setForm({ ...form, commune: e.target.value })}
                      className={inputInner}
                      disabled={!selectedWilaya}
                    >
                      <option value="">{locale === "fr" ? "Commune / province" : "البلدية"}</option>
                      {selectedWilaya?.communes.map((commune) => (
                        <option key={commune.id} value={commune.id}>
                          {locale === "ar" ? commune.nameAr : commune.nameFr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 p-4 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-neutral-500">{locale === "fr" ? "Produit" : "المنتج"}</span>
                      <span className="font-bold">{formatDA(subtotal, locale)}</span>
                    </div>
                    <div className="mt-3 border-t border-neutral-200 pt-3 flex justify-between gap-3 text-base">
                      <span className="font-black">{locale === "fr" ? "Total" : "المجموع"}</span>
                      <span className="font-black text-[#a855f7]">{formatDA(total, locale)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-14 w-full rounded-full bg-[#a855f7] text-white font-black uppercase tracking-wide shadow-[0_10px_30px_-12px_rgba(168,85,247,0.8)] transition hover:bg-[#9333ea] disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="size-5 animate-spin" /> : <ShoppingCart className="size-5" />}
                    {locale === "fr" ? "Confirmer la commande" : "تأكيد الطلب"}
                  </button>
                </div>
              )}
            </form>

            {description && (
              <div className="mt-2">
                <span className="eyebrow mb-3 block">{locale === "fr" ? "Description" : "الوصف"}</span>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{description}</p>
              </div>
            )}
          </div>
        </div>

        {related.filter((p) => p.id !== product.id).slice(0, 4).length > 0 && (
          <section className="mt-24">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="eyebrow text-lime">{"\\ VOUS AIMEREZ AUSSI"}</span>
                <h2 className="font-display font-bold text-2xl md:text-3xl mt-2 uppercase tracking-tight">
                  {locale === "fr" ? "Vous pourriez aussi aimer" : "قد يعجبك أيضاً"}
                </h2>
              </div>
              {cat && (
                <Link to="/category/$slug" params={{ slug: cat.slug }} className="eyebrow hover:text-lime hidden md:block">
                  {t.all} →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {related.filter((p) => p.id !== product.id).slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile CTA — animated purple pill */}
      {!outOfStock && (<div
        className={`lg:hidden fixed bottom-4 inset-x-0 z-[70] flex justify-center pointer-events-none transition-all duration-300 ${
          showStickyCTA ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <button
          onClick={scrollToForm}
          className="pointer-events-auto h-12 px-8 rounded-full bg-[#a855f7] text-white font-bold text-sm tracking-wide flex items-center justify-center active:scale-95 transition shadow-[0_10px_40px_-8px_rgba(168,85,247,0.7)] animate-cta-pulse"
        >
          {locale === "fr" ? "Commander" : "اطلب الآن"}
        </button>
      </div>)}
    </SiteShell>
  );
}
