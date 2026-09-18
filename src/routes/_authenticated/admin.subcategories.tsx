import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesQO, subcategoriesQO, allProductsAdminQO, type Subcategory } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Image as ImageIcon, Eye, EyeOff, X, Save } from "lucide-react";
import {
  AdminPage, AdminCard, AdminEmpty, ConfirmDialog,
  inputCls, labelCls, btnPrimary, btnSecondary,
} from "@/components/admin/shell";
import { SingleImageUploader } from "@/components/admin/image-uploader";
import { deleteImage } from "@/lib/admin-upload";

export const Route = createFileRoute("/_authenticated/admin/subcategories")({
  component: SubcategoriesAdmin,
});

function SubcategoriesAdmin() {
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery(categoriesQO);
  const { data: subs = [] } = useQuery(subcategoriesQO);
  const { data: products = [] } = useQuery(allProductsAdminQO);
  const [filterCat, setFilterCat] = useState("");
  const [editing, setEditing] = useState<Subcategory | "new" | null>(null);
  const [confirmDel, setConfirmDel] = useState<Subcategory | null>(null);

  const filtered = useMemo(
    () => (filterCat ? subs.filter((s) => s.category_id === filterCat) : subs),
    [subs, filterCat]
  );

  const toggleVisibility = async (id: string, visible: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("subcategories") as any).update({ visible }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(visible ? "Affichée" : "Masquée");
    qc.invalidateQueries();
  };

  const del = async (s: Subcategory) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cover = (s as any).cover_url as string | null | undefined;
    if (cover) await deleteImage("category-images", cover).catch(() => {});
    const { error } = await supabase.from("subcategories").delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Sous-catégorie supprimée");
    setConfirmDel(null);
    qc.invalidateQueries();
  };

  return (
    <AdminPage
      title="Sous-catégories"
      subtitle={`${filtered.length} sous-catégorie(s)`}
      actions={<button onClick={() => setEditing("new")} className={btnPrimary}><Plus className="size-4" /> Nouvelle</button>}
    >
      <AdminCard className="!p-3 md:!p-4 mb-4">
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className={inputCls + " max-w-xs"}>
          <option value="">Toutes les catégories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
        </select>
      </AdminCard>

      {filtered.length === 0 ? (
        <AdminEmpty title="Aucune sous-catégorie" action={<button onClick={() => setEditing("new")} className={btnPrimary}><Plus className="size-4" /> Créer une sous-catégorie</button>}>
          Ajoutez des sous-catégories pour affiner votre catalogue.
        </AdminEmpty>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const parent = categories.find((c) => c.id === s.category_id);
            const productCount = products.filter((p) => p.subcategory_id === s.id).length;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const visible = (s as any).visible !== false;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cover = (s as any).cover_url as string | null | undefined;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const banner = (s as any).banner_url as string | null | undefined;
            return (
              <AdminCard key={s.id} className="!p-0 overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">Pas d'image</div>}
                  {banner && <div className="absolute bottom-0 inset-x-0 h-8 opacity-80"><img src={banner} alt="" className="w-full h-full object-cover" /></div>}
                  {!visible && <div className="absolute inset-0 bg-black/60 grid place-items-center text-xs font-bold uppercase tracking-widest">Masquée</div>}
                </div>
                <div className="p-4">
                  <div className="text-[11px] uppercase tracking-widest text-accent font-mono truncate">{parent?.name_fr ?? "—"}</div>
                  <h3 className="font-bold truncate mt-0.5">{s.name_fr}</h3>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">/{s.slug}</p>
                  <div className="mt-3 text-xs text-muted-foreground">{productCount} produit(s)</div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button onClick={() => setEditing(s)} className={btnSecondary + " !py-2 !px-3 !text-xs"}><Pencil className="size-3.5" /> Modifier</button>
                    <button onClick={() => setEditing(s)} className={btnPrimary + " !py-2 !px-3 !text-xs"}><ImageIcon className="size-3.5" /> Photos</button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => toggleVisibility(s.id, !visible)} className="p-2 rounded-lg border border-hairline hover:bg-white/5" title={visible ? "Masquer" : "Afficher"}>
                      {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </button>
                    <button onClick={() => setConfirmDel(s)} className="p-2 rounded-lg border border-hairline text-muted-foreground hover:text-destructive hover:border-destructive"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}

      {editing && (
        <SubcategoryEditor
          subcategory={editing === "new" ? null : editing}
          categories={categories}
          defaultCategoryId={filterCat || categories[0]?.id || ""}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries(); }}
        />
      )}

      <ConfirmDialog
        open={!!confirmDel}
        title={`Supprimer « ${confirmDel?.name_fr ?? ""} » ?`}
        confirmLabel="Supprimer"
        danger
        onCancel={() => setConfirmDel(null)}
        onConfirm={async () => { if (confirmDel) await del(confirmDel); }}
      />
    </AdminPage>
  );
}

function SubcategoryEditor({
  subcategory, categories, defaultCategoryId, onClose, onSaved,
}: {
  subcategory: Subcategory | null;
  categories: { id: string; name_fr: string }[];
  defaultCategoryId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    category_id: subcategory?.category_id ?? defaultCategoryId,
    name_fr: subcategory?.name_fr ?? "",
    name_ar: subcategory?.name_ar ?? "",
    slug: subcategory?.slug ?? "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cover_url: ((subcategory as any)?.cover_url ?? null) as string | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    banner_url: ((subcategory as any)?.banner_url ?? null) as string | null,
    position: subcategory?.position ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name_fr.trim() || !form.category_id) return toast.error("Nom et catégorie requis");
    setSaving(true);
    try {
      const payload = {
        category_id: form.category_id,
        name_fr: form.name_fr.trim(),
        name_ar: form.name_ar.trim() || null,
        slug: (form.slug.trim() || slugify(form.name_fr)) + (subcategory ? "" : "-" + Math.random().toString(36).slice(2, 5)),
        cover_url: form.cover_url,
        banner_url: form.banner_url,
        position: form.position,
      };
      if (subcategory) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("subcategories") as any).update(payload).eq("id", subcategory.id);
        if (error) throw error;
        toast.success("Sous-catégorie mise à jour");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("subcategories") as any).insert(payload);
        if (error) throw error;
        toast.success("Sous-catégorie créée");
      }
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-card border border-hairline w-full sm:max-w-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 p-4 border-b border-hairline bg-card flex items-center justify-between">
          <h2 className="font-semibold">{subcategory ? "Modifier la sous-catégorie" : "Nouvelle sous-catégorie"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X className="size-4" /></button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className={labelCls}>Catégorie parente *</label>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={inputCls}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SingleImageUploader bucket="category-images" value={form.cover_url} onChange={(url) => setForm({ ...form, cover_url: url })} label="Photo sous-catégorie" aspect="square" />
            <SingleImageUploader bucket="category-images" value={form.banner_url} onChange={(url) => setForm({ ...form, banner_url: url })} label="Bannière sous-catégorie" aspect="banner" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nom (FR) *</label>
              <input value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nom (AR)</label>
              <input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className={inputCls} dir="rtl" />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} placeholder="auto" />
            </div>
            <div>
              <label className={labelCls}>Ordre</label>
              <input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} className={inputCls} />
            </div>
          </div>

        </div>
        <div className="sticky bottom-0 p-4 border-t border-hairline bg-card flex justify-end gap-2">
          <button onClick={onClose} className={btnSecondary}>Annuler</button>
          <button onClick={save} disabled={saving} className={btnPrimary}><Save className="size-4" /> {saving ? "…" : "Enregistrer"}</button>
        </div>
      </div>
    </div>
  );
}
