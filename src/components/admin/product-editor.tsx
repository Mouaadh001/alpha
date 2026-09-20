import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesQO, type Product } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/format";
import { toast } from "sonner";
import { z } from "zod";
import { Save, Trash2 } from "lucide-react";
import { AdminPage, AdminActionBar, ConfirmDialog, btnDanger } from "@/components/admin/shell";
import { MultiImageUploader } from "@/components/admin/image-uploader";
import { getErrorMessage } from "@/lib/errors";

const fieldCls =
  "w-full h-12 px-4 rounded-2xl bg-[#111317] border border-[#23262F] text-white placeholder:text-white/30 text-[15px] outline-none transition focus:border-[#FF2B2B]/60 focus:ring-2 focus:ring-[#FF2B2B]/20";
const areaCls =
  "w-full px-4 py-3 rounded-2xl bg-[#111317] border border-[#23262F] text-white placeholder:text-white/30 text-[15px] outline-none transition focus:border-[#FF2B2B]/60 focus:ring-2 focus:ring-[#FF2B2B]/20 resize-y min-h-[120px]";
const lblCls = "block text-[13px] font-medium text-white/80 mb-2";
const btnCancel =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl border border-[#23262F] bg-transparent text-white/80 hover:bg-white/[0.03] hover:text-white transition text-sm font-medium";
const btnSave =
  "inline-flex items-center justify-center gap-2 h-11 px-6 rounded-2xl bg-[#FF2B2B] hover:bg-[#ff4141] text-white shadow-lg shadow-[#FF2B2B]/20 transition text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed";

const schema = z.object({
  name_fr: z.string().trim().min(2).max(200),
  description_fr: z.string().trim().max(5000).optional().or(z.literal("")),
  price_da: z.number().int().min(0),
  compare_at_price_da: z.number().int().min(0).nullable(),
  category_id: z.string().uuid("Vous devez choisir une catégorie."),
  is_new: z.boolean(),
  storage_option_1: z.string().trim().max(40).nullable(),
  storage_option_2: z.string().trim().max(40).nullable(),
  price_da_option_2: z.number().int().min(0).nullable(),
  family_key: z.string().trim().max(60).nullable(),
});

type FormState = {
  name_fr: string;
  description_fr: string;
  price_da: string; compare_at_price_da: string;
  category_id: string;
  is_new: boolean;
  storage_option_1: string;
  storage_option_2: string;
  price_da_option_2: string;
  family_key: string;
  stock: string;
};

function fromProduct(p: Product): FormState {
  return {
    name_fr: p.name_fr,
    description_fr: p.description_fr ?? "",
    price_da: String(p.price_da ?? ""), compare_at_price_da: p.compare_at_price_da ? String(p.compare_at_price_da) : "",
    category_id: p.category_id,
    is_new: !!p.is_new,
    storage_option_1: p.storage_option_1 ?? "",
    storage_option_2: p.storage_option_2 ?? "",
    price_da_option_2: p.price_da_option_2 ? String(p.price_da_option_2) : "",
    family_key: p.family_key ?? "",
    stock: String(p.stock ?? 0),
  };
}

const EMPTY: FormState = {
  name_fr: "",
  description_fr: "",
  price_da: "", compare_at_price_da: "",
  category_id: "",
  is_new: true,
  storage_option_1: "",
  storage_option_2: "",
  price_da_option_2: "",
  family_key: "",
  stock: "1",
};

export function ProductEditor({ product, onDone }: { product?: Product; onDone?: () => void }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery(categoriesQO);

  const [form, setForm] = useState<FormState>(product ? fromProduct(product) : EMPTY);
  const [images, setImages] = useState<string[]>(product?.images ?? (product?.image_url ? [product.image_url] : []));
  const [coverIdx, setCoverIdx] = useState(() => {
    if (!product) return 0;
    const cover = product.cover_image ?? product.image_url;
    const list = product.images ?? (cover ? [cover] : []);
    const i = cover ? list.indexOf(cover) : 0;
    return i < 0 ? 0 : i;
  });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);


  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const parsed = schema.parse({
        ...form,
        price_da: Number(form.price_da || 0),
        compare_at_price_da: form.compare_at_price_da ? Number(form.compare_at_price_da) : null,
        storage_option_1: form.storage_option_1.trim() || null,
        storage_option_2: form.storage_option_2.trim() || null,
        price_da_option_2: form.price_da_option_2 ? Number(form.price_da_option_2) : null,
        family_key: form.family_key.trim() || null,
      });
      const stockVal = Math.max(0, Math.floor(Number(form.stock || 0)));

      const cover = images[coverIdx] ?? images[0] ?? null;
      const payload = {
        name_fr: parsed.name_fr,
        description_fr: parsed.description_fr || null,
        price_da: parsed.price_da,
        compare_at_price_da: parsed.compare_at_price_da,
        category_id: parsed.category_id,
        image_url: cover,
        cover_image: cover,
        images,
        is_new: parsed.is_new,
        storage_option_1: parsed.storage_option_1,
        storage_option_2: parsed.storage_option_2,
        price_da_option_2: parsed.price_da_option_2,
        family_key: parsed.family_key,
        stock: stockVal,
      };

      if (product) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
        toast.success("Produit mis à jour");
      } else {
        const slug = `${slugify(parsed.name_fr)}-${Math.random().toString(36).slice(2, 6)}`;
        const { error } = await supabase.from("products").insert({ ...payload, slug, active: true });
        if (error) throw error;
        toast.success("Produit créé");
      }
      qc.invalidateQueries();
      if (onDone) onDone();
      else navigate({ to: "/admin/products" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Impossible d'enregistrer le produit"));
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!product) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) return toast.error(error.message);
    toast.success("Produit supprimé");
    qc.invalidateQueries();
    if (onDone) onDone();
    else navigate({ to: "/admin/products" });
  };

  const body = (
    <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lblCls}>Catégorie *</label>
          <select required value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} className={fieldCls}>
            <option value="">— Choisir —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={lblCls}>Nom du produit *</label>
        <input required value={form.name_fr} onChange={(e) => set("name_fr", e.target.value)} className={fieldCls} placeholder="Ex: PlayStation 5 Slim" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lblCls}>Prix (DA) *</label>
          <input required type="number" min={0} value={form.price_da} onChange={(e) => set("price_da", e.target.value)} className={fieldCls} placeholder="0" />
        </div>
        <div>
          <label className={lblCls}>Ancien prix (DA)</label>
          <input type="number" min={0} value={form.compare_at_price_da} onChange={(e) => set("compare_at_price_da", e.target.value)} className={fieldCls} placeholder="Facultatif" />
        </div>
      </div>

      <div>
        <label className={lblCls}>Stock disponible *</label>
        <input
          required
          type="number"
          min={0}
          step={1}
          value={form.stock}
          onChange={(e) => set("stock", e.target.value)}
          className={fieldCls}
          placeholder="Ex: 10"
        />
        <div className="text-[12px] text-white/50 mt-2">
          Mettez 0 pour marquer le produit comme rupture de stock.
        </div>
      </div>

      <div>
        <label className={lblCls}>Images</label>
        <MultiImageUploader
          bucket="product-images"
          value={images}
          onChange={setImages}
          coverIndex={coverIdx}
          onCoverChange={setCoverIdx}
        />
      </div>

      <div className="rounded-2xl border border-[#23262F] bg-[#0D0F13] p-4 space-y-3">
        <div>
          <div className="text-[15px] font-semibold text-white/90">Tailles / Stockage (optionnel)</div>
          <div className="text-[12px] text-white/50 mt-1">
            Ex: 500GB / 1TB. Laissez vide si le produit n'a qu'une seule taille.
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lblCls}>Taille 1 (prix ci-dessus)</label>
            <input value={form.storage_option_1} onChange={(e) => set("storage_option_1", e.target.value)} className={fieldCls} placeholder="Ex: 500GB" />
          </div>
          <div>
            <label className={lblCls}>Taille 2</label>
            <input value={form.storage_option_2} onChange={(e) => set("storage_option_2", e.target.value)} className={fieldCls} placeholder="Ex: 1TB" />
          </div>
        </div>
        <div>
          <label className={lblCls}>Prix Taille 2 (DA)</label>
          <input type="number" min={0} value={form.price_da_option_2} onChange={(e) => set("price_da_option_2", e.target.value)} className={fieldCls} placeholder="Prix de la taille 2" />
        </div>
      </div>

      <div>
        <label className={lblCls}>Groupe / Famille (optionnel)</label>
        <input
          value={form.family_key}
          onChange={(e) => set("family_key", e.target.value)}
          className={fieldCls}
          placeholder="Ex: ps5-slim, xbox-series-x"
        />
        <div className="text-[12px] text-white/50 mt-2">
          Les produits partageant la même clé s'affichent comme éditions sur la page produit.
        </div>
      </div>

      <div>
        <label className={lblCls}>Description</label>
        <textarea rows={5} value={form.description_fr} onChange={(e) => set("description_fr", e.target.value)} className={areaCls} placeholder="Détails, spécifications, contenu de la boîte…" />
      </div>

      <label className="flex items-center justify-between gap-3 h-12 px-4 rounded-2xl border border-[#23262F] bg-[#111317] cursor-pointer hover:bg-white/[0.02] transition">
        <span className="text-[15px] text-white/90">Marquer comme Nouveau</span>
        <input type="checkbox" checked={form.is_new} onChange={(e) => set("is_new", e.target.checked)} className="size-4 accent-[#FF2B2B]" />
      </label>

      {onDone ? (
        <div className="sticky bottom-0 -mx-4 md:-mx-5 mt-6 px-4 md:px-5 py-3 bg-[#0B0B0F]/95 backdrop-blur border-t border-[#23262F] flex items-center justify-between gap-3">
          <button type="button" onClick={onDone} className={btnCancel}>Annuler</button>
          <button type="submit" disabled={saving} className={btnSave}>
            <Save className="size-4" /> {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      ) : (
        <AdminActionBar>
          <button type="button" onClick={() => navigate({ to: "/admin/products" })} className={btnCancel}>Annuler</button>
          <button type="submit" disabled={saving} className={btnSave}><Save className="size-4" /> {saving ? "Enregistrement…" : "Enregistrer"}</button>
        </AdminActionBar>
      )}

      <ConfirmDialog
        open={confirmDel}
        title="Supprimer ce produit ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        danger
        onCancel={() => setConfirmDel(false)}
        onConfirm={async () => { await del(); }}
      />
    </form>
  );

  // When rendered inside a modal, skip the AdminPage chrome.
  if (onDone) return body;

  return (
    <AdminPage
      title={product ? "Modifier le produit" : "Nouveau produit"}
      subtitle={product ? product.name_fr : "Ajoutez un article au catalogue."}
      actions={product ? <button onClick={() => setConfirmDel(true)} className={btnDanger}><Trash2 className="size-4" /> Supprimer</button> : null}
    >
      {body}
    </AdminPage>
  );
}
