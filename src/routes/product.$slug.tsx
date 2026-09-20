import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { SiteShell } from "@/components/site-shell";
import {
  productBySlugQO,
  categoriesQO,
  productsByCategoryPreviewQO,
  productFamilyQO,
} from "@/lib/queries";
import { useI18n, useT } from "@/lib/i18n";
import { formatDA } from "@/lib/format";
import { toast } from "sonner";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import { BackButton } from "@/components/back-button";
import {
  Minus, Plus, Loader2, ShoppingCart, User, Phone, MapPin,
  Tag, Truck, CheckCircle2, Package, Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/lib/errors";
import algeriaData from "../../algeria-data.json";

type AlgeriaCommune = { id: string; postCode: string; nameFr: string; nameAr: string };
type AlgeriaWilaya = { code: string; nameFr: string; nameAr: string; communes: AlgeriaCommune[] };
const ALGERIA_WILAYAS = algeriaData as AlgeriaWilaya[];

async function sendOrderEmail(orderId: string) {
  const { data, error } = await supabase.functions.invoke("send-order-email", {
    body: { order_id: orderId },
  });
  if (error) { console.warn("Order email was not sent:", error.message); return; }
  if (data && data.email_sent === false) {
    console.warn("Order email was not sent:", data.warning ?? data.reason ?? data.error ?? "Unknown email error");
  }
}

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
  errorComponent: ({ error }) => (
    <SiteShell><div className="p-12">{(error as Error).message}</div></SiteShell>
  ),
  notFoundComponent: () => (
    <SiteShell><div className="p-12">Produit introuvable.</div></SiteShell>
  ),
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

  const [selectedSiblingId, setSelectedSiblingId] = useState<string | null>(null);
  const product = (selectedSiblingId && familySiblings.find((p) => p.id === selectedSiblingId)) || loadedProduct;

  const cat = categories.find((c) => c.id === product.category_id);
  const name = locale === "ar" && product.name_ar ? product.name_ar : product.name_fr;
  const description = locale === "ar" && product.description_ar ? product.description_ar : product.description_fr;
  const gallery = product.images && product.images.length > 0 ? product.images : product.image_url ? [product.image_url] : [];

  const hasVariants = !!(product.storage_option_1 && product.storage_option_2 && product.price_da_option_2);
  const [selectedVariant, setSelectedVariant] = useState<"1" | "2">("1");
  useEffect(() => { setSelectedVariant("1"); }, [product.id]);

  const unitPrice = hasVariants && selectedVariant === "2" ? (product.price_da_option_2 as number) : product.price_da;
  const selectedVariantLabel = hasVariants ? (selectedVariant === "2" ? product.storage_option_2! : product.storage_option_1!) : null;
  const discountPct = product.compare_at_price_da && product.compare_at_price_da > unitPrice
    ? Math.round(100 - (unitPrice / product.compare_at_price_da) * 100) : 0;

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
    const io = new IntersectionObserver(([entry]) => setShowStickyCTA(!entry.isIntersecting), {
      rootMargin: "0px 0px -20% 0px", threshold: 0,
    });
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
  const selectedWilaya = ALGERIA_WILAYAS.find((w) => w.code === form.wilaya) ?? null;

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
        id: orderId, full_name: parsed.data.full_name, phone: parsed.data.phone,
        wilaya: wilayaName, commune: communeName, address: communeName,
        notes: null, subtotal_da: subtotal, total_da: total,
      });
      if (error) throw error;
      const { error: e2 } = await supabase.from("order_items").insert([{
        order_id: orderId, product_id: product.id,
        product_name: selectedVariantLabel ? `${name} — ${selectedVariantLabel}` : name,
        product_slug: product.slug, image_url: product.image_url,
        unit_price_da: unitPrice, quantity: qty, line_total_da: subtotal,
      }]);
      if (e2) throw e2;
      try { await sendOrderEmail(orderId); } catch (emailError) {
        console.warn("Order email was not sent:", getErrorMessage(emailError, "Unknown email error"));
      }
      navigate({ to: "/order/$id", params: { id: orderId } });
    } catch (err) {
      toast.error(getErrorMessage(err, locale === "fr" ? "Erreur" : "خطأ"));
      setSubmitting(false);
    }
  };

  /* ── style helpers ── */
  const fieldWrap = (n: string) =>
    `flex items-center gap-3 w-full h-13 rounded-xl bg-white/[0.04] border px-4 transition-all duration-200 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:bg-white/[0.07] ${errors[n] ? "border-red-500/70" : "border-white/10"}`;
  const inputInner = "flex-1 h-full bg-transparent text-sm font-medium text-white placeholder:text-white/30 focus:outline-none";
  const iconCls = "size-4 text-purple-400 shrink-0";

  const outOfStock = product.stock <= 0;

  return (
    <SiteShell>
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 pt-6 pb-24">
        <BackButton className="mb-4" />

        {/* Breadcrumb */}
        {cat && (
          <nav className="eyebrow mb-6 flex gap-2 flex-wrap text-white/40">
            <Link to="/" className="hover:text-lime transition-colors">{t.home}</Link>
            <span>/</span>
            <Link to="/category/$slug" params={{ slug: cat.slug }} className="hover:text-lime transition-colors">
              {locale === "ar" && cat.name_ar ? cat.name_ar : cat.name_fr}
            </Link>
            <span>/</span>
            <span className="text-white/70">{name}</span>
          </nav>
        )}

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-14 items-start">

          {/* LEFT — gallery */}
          <div className="-mx-4 md:mx-0">
            <ProductGallery images={gallery} alt={name} />
          </div>

          {/* RIGHT — info column */}
          <div className="flex flex-col gap-6">

            {/* ── Product header ── */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {product.brand && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-purple-400">
                    <Tag className="size-3" />{product.brand}
                  </span>
                )}
                {product.is_new && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-lime/15 border border-lime/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-lime">
                    Nouveau
                  </span>
                )}
                {product.is_bestseller && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 border border-amber-400/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
                    <Star className="size-2.5 fill-amber-300" /> Best-seller
                  </span>
                )}
              </div>
              <h1 className="font-display font-extrabold text-2xl md:text-4xl leading-[1.1] tracking-tight text-white mb-4">
                {name}
              </h1>

              {/* Price */}
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                <span className="text-3xl md:text-4xl font-display font-black text-white whitespace-nowrap">
                  {formatDA(unitPrice, locale)}
                </span>
                {discountPct > 0 && (
                  <>
                    <span className="text-base text-white/35 line-through">{formatDA(product.compare_at_price_da!, locale)}</span>
                    <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-black text-white">−{discountPct}%</span>
                  </>
                )}
              </div>

              {/* Trust badges row */}
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/50">
                  <Truck className="size-3.5 text-lime" />
                  {locale === "fr" ? "Livraison partout en Algérie" : "توصيل لكامل الجزائر"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/50">
                  <CheckCircle2 className="size-3.5 text-lime" />
                  {locale === "fr" ? "Paiement à la livraison" : "الدفع عند الاستلام"}
                </span>
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                    <Package className="size-3.5" />
                    {locale === "fr" ? `Plus que ${product.stock} en stock` : `${product.stock} قطع متبقية`}
                  </span>
                )}
              </div>
            </div>

            {/* ── Edition picker ── */}
            {showFamilyPicker && familySiblings.length > 1 && (
              <div>
                <p className="eyebrow mb-3">{locale === "fr" ? "Choisissez l'édition" : "اختر الإصدار"}</p>
                <div className="grid grid-cols-2 gap-2">
                  {familySiblings.map((sibling) => {
                    const sName = locale === "ar" && sibling.name_ar ? sibling.name_ar : sibling.name_fr;
                    const parentName = locale === "ar" && product.name_ar ? product.name_ar : product.name_fr;
                    const prefix = parentName.split(" ").slice(0, 3).join(" ");
                    const shortLabel = sName.toLowerCase().startsWith(prefix.toLowerCase()) ? sName.slice(prefix.length).trim() || sName : sName;
                    const isActive = sibling.id === product.id;
                    return (
                      <button key={sibling.id} type="button" onClick={() => { if (!isActive) setSelectedSiblingId(sibling.id); }}
                        className={`h-16 rounded-xl border px-3 text-start transition-all duration-200 ${isActive ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"}`}>
                        <span className="block text-sm font-bold text-white">{shortLabel}</span>
                        <span className="block text-xs font-mono text-white/50">{formatDA(sibling.price_da, locale)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Storage / Size picker ── */}
            {hasVariants && (
              <div>
                <p className="eyebrow mb-3">{locale === "fr" ? "Choisissez la taille / capacité" : "اختر الحجم / السعة"}</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: "1" as const, label: product.storage_option_1!, price: product.price_da },
                    { id: "2" as const, label: product.storage_option_2!, price: product.price_da_option_2! },
                  ]).map((opt) => (
                    <button key={opt.id} type="button" onClick={() => setSelectedVariant(opt.id)}
                      className={`h-16 rounded-xl border px-4 text-start transition-all duration-200 ${selectedVariant === opt.id ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"}`}>
                      <span className="block text-sm font-bold text-white">{opt.label}</span>
                      <span className="block text-xs font-mono text-white/50">{formatDA(opt.price, locale)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Description ── */}
            {description && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                <p className="eyebrow mb-3 text-purple-400">{locale === "fr" ? "Description" : "الوصف"}</p>
                <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{description}</p>
              </div>
            )}

            {/* ── Order form ── */}
            <form
              ref={formRef}
              onSubmit={submitOrder}
              className="rounded-2xl border border-white/10 bg-[#111118] p-5 md:p-6"
            >
              {outOfStock ? (
                <div className="rounded-xl bg-white/5 p-5 text-center text-sm font-semibold text-white/40">
                  {locale === "fr" ? "Produit en rupture de stock." : "المنتج غير متوفر حالياً."}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-4 pb-1">
                    <div>
                      <h2 className="text-base font-black uppercase tracking-wide text-white">
                        {locale === "fr" ? "Commander maintenant" : "اطلب الآن"}
                      </h2>
                      <p className="mt-0.5 text-[11px] text-white/40">
                        {locale === "fr" ? "Paiement à la livraison." : "الدفع عند الاستلام."}
                      </p>
                    </div>
                    {/* Qty stepper */}
                    <div className="flex items-center h-10 rounded-full border border-white/10 bg-white/[0.04] overflow-hidden">
                      <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="grid size-10 place-items-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors" aria-label="Decrease quantity">
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-black text-white">{qty}</span>
                      <button type="button" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                        className="grid size-10 place-items-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors" aria-label="Increase quantity">
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/8" />

                  {/* Fields */}
                  <div className={fieldWrap("full_name")}>
                    <User className={iconCls} />
                    <input ref={firstFieldRef} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      className={inputInner} placeholder={locale === "fr" ? "Nom complet" : "الاسم الكامل"} autoComplete="name" />
                  </div>

                  <div className={fieldWrap("phone")}>
                    <Phone className={iconCls} />
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={inputInner} placeholder={locale === "fr" ? "Téléphone" : "رقم الهاتف"} inputMode="tel" autoComplete="tel" />
                  </div>

                  <div className={fieldWrap("wilaya")}>
                    <MapPin className={iconCls} />
                    <select value={form.wilaya} onChange={(e) => setForm({ ...form, wilaya: e.target.value, commune: "" })}
                      className={`${inputInner} [&>option]:bg-[#111118] [&>option]:text-white`}>
                      <option value="">{locale === "fr" ? "Wilaya" : "الولاية"}</option>
                      {ALGERIA_WILAYAS.map((w) => (
                        <option key={w.code} value={w.code}>{w.code} - {locale === "ar" ? w.nameAr : w.nameFr}</option>
                      ))}
                    </select>
                  </div>

                  <div className={fieldWrap("commune")}>
                    <MapPin className={iconCls} />
                    <select value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })}
                      className={`${inputInner} [&>option]:bg-[#111118] [&>option]:text-white`} disabled={!selectedWilaya}>
                      <option value="">{locale === "fr" ? "Commune / province" : "البلدية"}</option>
                      {selectedWilaya?.communes.map((c) => (
                        <option key={c.id} value={c.id}>{locale === "ar" ? c.nameAr : c.nameFr}</option>
                      ))}
                    </select>
                  </div>

                  {/* Order summary */}
                  <div className="rounded-xl bg-white/[0.04] border border-white/8 p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">
                        {locale === "fr" ? "Produit" : "المنتج"}{qty > 1 ? ` ×${qty}` : ""}
                        {selectedVariantLabel && <span className="ml-1.5 text-xs text-purple-400">({selectedVariantLabel})</span>}
                      </span>
                      <span className="font-black text-white tabular-nums">{formatDA(subtotal, locale)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <span>{locale === "fr" ? "Livraison" : "التوصيل"}</span>
                      <span className="text-lime font-bold">{locale === "fr" ? "Gratuite" : "مجاناً"}</span>
                    </div>
                    <div className="h-px bg-white/8 my-1" />
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white text-base">Total</span>
                      <span className="text-xl font-black text-purple-400 tabular-nums">{formatDA(total, locale)}</span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit" disabled={submitting}
                    className="h-14 w-full rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white font-black uppercase tracking-wide shadow-[0_8px_30px_-8px_rgba(168,85,247,0.8)] transition-all duration-200 hover:from-purple-500 hover:to-purple-400 hover:shadow-[0_12px_40px_-8px_rgba(168,85,247,0.9)] disabled:opacity-50 flex items-center justify-center gap-2.5"
                  >
                    {submitting ? <Loader2 className="size-5 animate-spin" /> : <ShoppingCart className="size-5" />}
                    {locale === "fr" ? "Confirmer la commande" : "تأكيد الطلب"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* ── Related products ── */}
        {related.filter((p) => p.id !== product.id).slice(0, 4).length > 0 && (
          <section className="mt-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="eyebrow text-lime">\ VOUS AIMEREZ AUSSI</span>
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

      {/* Sticky mobile CTA */}
      {!outOfStock && (
        <div className={`lg:hidden fixed bottom-4 inset-x-0 z-[70] flex justify-center pointer-events-none transition-all duration-300 ${showStickyCTA ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <button onClick={scrollToForm}
            className="pointer-events-auto h-12 px-8 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-sm tracking-wide flex items-center justify-center active:scale-95 transition shadow-[0_10px_40px_-8px_rgba(168,85,247,0.7)]">
            <ShoppingCart className="size-4 mr-2" />
            {locale === "fr" ? "Commander" : "اطلب الآن"}
          </button>
        </div>
      )}
    </SiteShell>
  );
}
