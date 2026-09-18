import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { homepageSectionsQO } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, Eye, EyeOff, Save, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { SingleImageUploader } from "@/components/admin/image-uploader";

export const Route = createFileRoute("/_authenticated/admin/homepage")({
  component: HomepageBuilder,
});

const SECTION_LABELS: Record<string, { fr: string; hint: string }> = {
  hero: { fr: "Hero — Slider principal", hint: "Grandes images d'accueil" },
  value_strip: { fr: "Barre d'avantages", hint: "Livraison · Garantie · Paiement" },
  featured_categories: { fr: "Univers en vedette", hint: "Grille des grandes tuiles catégories" },
  featured_products: { fr: "Sélection produits", hint: "Grille du catalogue en avant" },
  category_strips: { fr: "Bandes par catégorie", hint: "Aperçu 4 produits par catégorie" },
  promo_banner: { fr: "Bandeau promo cinématique", hint: "Bloc marketing plein écran" },
  newsletter: { fr: "Newsletter", hint: "Inscription email" },
  brand_logos: { fr: "Logos marques", hint: "Bande de logos partenaires" },
  top_consoles: { fr: "Top consoles", hint: "Vitrine PS5 · Xbox · Switch" },
};

function HomepageBuilder() {
  const qc = useQueryClient();
  const { data: sections = [] } = useQuery(homepageSectionsQO);
  const [local, setLocal] = useState(sections);
  useEffect(() => setLocal(sections), [sections]);
  const [saving, setSaving] = useState(false);

  const move = (i: number, dir: -1 | 1) => {
    const next = [...local];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setLocal(next.map((s, idx) => ({ ...s, position: idx })));
  };

  const toggle = (id: string) => setLocal((l) => l.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));

  const updateConfig = (id: string, config: Record<string, unknown>) =>
    setLocal((l) => l.map((s) => (s.id === id ? { ...s, config } : s)));

  const save = async () => {
    setSaving(true);
    try {
      for (const s of local) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from("homepage_sections").update({ position: s.position, enabled: s.enabled, config: s.config as any }).eq("id", s.id);
        if (error) throw error;
      }
      toast.success("Homepage enregistrée");
      qc.invalidateQueries({ queryKey: ["homepage_sections"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <span className="eyebrow text-lime">\\ CMS</span>
          <h1 className="font-display font-bold text-4xl mt-3 uppercase tracking-tight">Homepage Builder</h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-lg">
            Réordonnez, activez, éditez les textes, images et boutons de chaque section de votre page d'accueil.
          </p>
        </div>
        <button onClick={save} disabled={saving} className="btn-lime"><Save className="size-4" /> {saving ? "Enregistrement…" : "Tout enregistrer"}</button>
      </div>

      <div className="space-y-3">
        {local.map((s, i) => {
          const meta = SECTION_LABELS[s.section_type] ?? { fr: s.section_type, hint: "" };
          return (
            <div key={s.id} className={`border transition-colors ${s.enabled ? "border-hairline" : "border-hairline/50 opacity-50"}`}>
              <div className="p-4 flex items-center gap-4 bg-surface">
                <div className="flex flex-col">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-lime disabled:opacity-30"><ChevronUp className="size-4" /></button>
                  <button onClick={() => move(i, 1)} disabled={i === local.length - 1} className="text-muted-foreground hover:text-lime disabled:opacity-30"><ChevronDown className="size-4" /></button>
                </div>
                <div className="text-xs font-mono text-muted-foreground w-8">#{String(i + 1).padStart(2, "0")}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm uppercase tracking-widest">{meta.fr}</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{meta.hint} · {s.section_type}</div>
                </div>
                <button onClick={() => toggle(s.id)} title={s.enabled ? "Masquer" : "Afficher"} className={`size-9 grid place-items-center border transition-colors ${s.enabled ? "border-lime text-lime" : "border-hairline text-muted-foreground"}`}>
                  {s.enabled ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
              </div>
              {s.enabled && (
                <ConfigEditor value={s.config ?? {}} onChange={(cfg) => updateConfig(s.id, cfg)} type={s.section_type} />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={save} disabled={saving} className="btn-lime"><Save className="size-4" /> {saving ? "Enregistrement…" : "Tout enregistrer"}</button>
      </div>
    </div>
  );
}

function ConfigEditor({ value, onChange, type }: { value: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void; type: string }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  const input = "w-full bg-background border border-hairline rounded-md px-3 py-2 text-sm focus:outline-none focus:border-lime";
  const label = "eyebrow block mb-2";
  const str = (k: string) => String(value[k] ?? "");
  const arr = (k: string): string[] => Array.isArray(value[k]) ? (value[k] as string[]) : [];

  return (
    <div className="p-4 md:p-5 border-t border-hairline grid grid-cols-1 md:grid-cols-2 gap-4 bg-background/40">
      {type === "hero" && (
        <>
          <div>
            <label className={label}>Pilule (FR)</label>
            <input value={str("pill_fr")} onChange={(e) => set("pill_fr", e.target.value)} className={input} placeholder="Boostez votre expérience" />
          </div>
          <div>
            <label className={label}>Pilule (AR)</label>
            <input value={str("pill_ar")} onChange={(e) => set("pill_ar", e.target.value)} className={input} dir="rtl" placeholder="عزّز تجربتك" />
          </div>
          <div>
            <label className={label}>Titre principal (FR)</label>
            <input value={str("title_fr")} onChange={(e) => set("title_fr", e.target.value)} className={input} placeholder="Accessoires Gaming" />
          </div>
          <div>
            <label className={label}>Titre principal (AR)</label>
            <input value={str("title_ar")} onChange={(e) => set("title_ar", e.target.value)} className={input} dir="rtl" placeholder="إكسسوارات الألعاب" />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Description (FR)</label>
            <textarea value={str("desc_fr")} onChange={(e) => set("desc_fr", e.target.value)} className={input + " min-h-[70px]"} placeholder="Découvrez notre gamme d'accessoires gaming indispensables." />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Description (AR)</label>
            <textarea value={str("desc_ar")} onChange={(e) => set("desc_ar", e.target.value)} className={input + " min-h-[70px]"} dir="rtl" />
          </div>
          <div>
            <label className={label}>Bouton — texte (FR)</label>
            <input value={str("cta_fr")} onChange={(e) => set("cta_fr", e.target.value)} className={input} placeholder="Découvrir" />
          </div>
          <div>
            <label className={label}>Bouton — texte (AR)</label>
            <input value={str("cta_ar")} onChange={(e) => set("cta_ar", e.target.value)} className={input} dir="rtl" placeholder="اكتشف" />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Bouton — lien</label>
            <input value={str("cta_href")} onChange={(e) => set("cta_href", e.target.value)} className={input} placeholder="/category/playstation" />
          </div>
          <div className="md:col-span-2">
            <SingleImageUploader
              bucket="category-images"
              value={str("bg_image") || null}
              onChange={(url) => set("bg_image", url ?? "")}
              label="Image de fond (optionnel)"
              aspect="banner"
            />
          </div>
        </>
      )}

      {type === "value_strip" && (
        <>
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-hairline p-3 space-y-2 md:col-span-1">
              <div className="eyebrow">Avantage #{i + 1}</div>
              <input value={str(`item_${i}_title_fr`)} onChange={(e) => set(`item_${i}_title_fr`, e.target.value)} className={input} placeholder="Titre (FR)" />
              <input value={str(`item_${i}_title_ar`)} onChange={(e) => set(`item_${i}_title_ar`, e.target.value)} className={input} dir="rtl" placeholder="العنوان (AR)" />
              <input value={str(`item_${i}_desc_fr`)} onChange={(e) => set(`item_${i}_desc_fr`, e.target.value)} className={input} placeholder="Sous-titre (FR)" />
              <input value={str(`item_${i}_desc_ar`)} onChange={(e) => set(`item_${i}_desc_ar`, e.target.value)} className={input} dir="rtl" placeholder="السطر الثاني (AR)" />
            </div>
          ))}
        </>
      )}

      {(type === "featured_categories" || type === "featured_products" || type === "category_strips" || type === "top_consoles") && (
        <>
          <div>
            <label className={label}>Titre (FR)</label>
            <input value={str("title_fr")} onChange={(e) => set("title_fr", e.target.value)} className={input} />
          </div>
          <div>
            <label className={label}>Titre (AR)</label>
            <input value={str("title_ar")} onChange={(e) => set("title_ar", e.target.value)} className={input} dir="rtl" />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Sous-titre (FR)</label>
            <input value={str("subtitle_fr")} onChange={(e) => set("subtitle_fr", e.target.value)} className={input} />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Sous-titre (AR)</label>
            <input value={str("subtitle_ar")} onChange={(e) => set("subtitle_ar", e.target.value)} className={input} dir="rtl" />
          </div>
          {type === "featured_products" && (
            <div>
              <label className={label}>Nombre de produits</label>
              <input type="number" min={4} max={20} value={Number(value.limit ?? 10)} onChange={(e) => set("limit", Number(e.target.value))} className={input} />
            </div>
          )}
          {type === "top_consoles" && (
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-hairline">
              <div className="md:col-span-2 -mb-2">
                <div className="eyebrow">Images des consoles</div>
                <p className="text-[11px] text-muted-foreground mt-1">Remplacez l'image de chaque console. Laissez vide pour utiliser l'image par défaut.</p>
              </div>
              {[
                { k: "ps5", label: "PlayStation 5" },
                { k: "ps4", label: "PlayStation 4" },
                { k: "xbox_x", label: "Xbox Series X" },
                { k: "xbox_s", label: "Xbox Series S" },
              ].map(({ k, label: lbl }) => (
                <SingleImageUploader
                  key={k}
                  bucket="category-images"
                  value={str(`image_${k}`) || null}
                  onChange={(url) => set(`image_${k}`, url ?? "")}
                  label={lbl}
                  aspect="square"
                />
              ))}
            </div>
          )}
        </>
      )}

      {type === "promo_banner" && (
        <>
          <div>
            <label className={label}>Titre (FR)</label>
            <input value={str("title_fr")} onChange={(e) => set("title_fr", e.target.value)} className={input} />
          </div>
          <div>
            <label className={label}>Titre (AR)</label>
            <input value={str("title_ar")} onChange={(e) => set("title_ar", e.target.value)} className={input} dir="rtl" />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Sous-titre (FR)</label>
            <textarea value={str("subtitle_fr")} onChange={(e) => set("subtitle_fr", e.target.value)} className={input + " min-h-[70px]"} />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Sous-titre (AR)</label>
            <textarea value={str("subtitle_ar")} onChange={(e) => set("subtitle_ar", e.target.value)} className={input + " min-h-[70px]"} dir="rtl" />
          </div>
          <div>
            <label className={label}>Bouton — texte (FR)</label>
            <input value={str("cta_fr")} onChange={(e) => set("cta_fr", e.target.value)} className={input} />
          </div>
          <div>
            <label className={label}>Bouton — texte (AR)</label>
            <input value={str("cta_ar")} onChange={(e) => set("cta_ar", e.target.value)} className={input} dir="rtl" />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Bouton — lien</label>
            <input value={str("cta_href")} onChange={(e) => set("cta_href", e.target.value)} className={input} />
          </div>
          <div className="md:col-span-2">
            <SingleImageUploader
              bucket="category-images"
              value={str("bg_image") || null}
              onChange={(url) => set("bg_image", url ?? "")}
              label="Image de fond"
              aspect="banner"
            />
          </div>
        </>
      )}

      {type === "newsletter" && (
        <>
          <div>
            <label className={label}>Titre (FR)</label>
            <input value={str("title_fr")} onChange={(e) => set("title_fr", e.target.value)} className={input} placeholder="Rejoignez la newsletter" />
          </div>
          <div>
            <label className={label}>Titre (AR)</label>
            <input value={str("title_ar")} onChange={(e) => set("title_ar", e.target.value)} className={input} dir="rtl" />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Sous-titre (FR)</label>
            <input value={str("subtitle_fr")} onChange={(e) => set("subtitle_fr", e.target.value)} className={input} />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Sous-titre (AR)</label>
            <input value={str("subtitle_ar")} onChange={(e) => set("subtitle_ar", e.target.value)} className={input} dir="rtl" />
          </div>
          <div>
            <label className={label}>Placeholder email</label>
            <input value={str("placeholder")} onChange={(e) => set("placeholder", e.target.value)} className={input} placeholder="votre@email.com" />
          </div>
          <div>
            <label className={label}>Texte bouton</label>
            <input value={str("cta_fr")} onChange={(e) => set("cta_fr", e.target.value)} className={input} placeholder="S'inscrire" />
          </div>
        </>
      )}

      {type === "brand_logos" && (
        <div className="md:col-span-2">
          <label className={label}>Logos partenaires</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {arr("logos").map((url, idx) => (
              <div key={idx} className="relative">
                <SingleImageUploader
                  bucket="category-images"
                  value={url}
                  onChange={(u) => {
                    const next = [...arr("logos")];
                    if (u) next[idx] = u; else next.splice(idx, 1);
                    set("logos", next);
                  }}
                  label={`Logo ${idx + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = arr("logos").filter((_, i) => i !== idx);
                    set("logos", next);
                  }}
                  className="absolute -top-1 -right-1 size-6 rounded-full bg-destructive text-white grid place-items-center"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => set("logos", [...arr("logos"), ""])}
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold border border-hairline rounded-full px-3 py-2 hover:border-lime hover:text-lime"
          >
            <Plus className="size-3.5" /> Ajouter un logo
          </button>
        </div>
      )}
    </div>
  );
}