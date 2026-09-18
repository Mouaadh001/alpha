import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesQO, subcategoriesQO, allProductsAdminQO, type Category } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Eye, EyeOff, X, Save, Layers } from "lucide-react";
import {
  AdminPage, AdminCard, AdminEmpty, ConfirmDialog,
  inputCls, labelCls, btnPrimary, btnSecondary, btnDanger,
} from "@/components/admin/shell";
import { SingleImageUploader } from "@/components/admin/image-uploader";
import { deleteImage } from "@/lib/admin-upload";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesAdmin,
});

function CategoriesAdmin() {
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery(categoriesQO);
  const { data: subs = [] } = useQuery(subcategoriesQO);
  const { data: products = [] } = useQuery(allProductsAdminQO);
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [confirmDel, setConfirmDel] = useState<Category | null>(null);

  const toggleVisibility = async (id: string, visible: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("categories") as any).update({ visible }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(visible ? "Affichée" : "Masquée");
    qc.invalidateQueries();
  };

  const del = async (c: Category) => {
    // best-effort image cleanup
    await Promise.all([
      c.image_url ? deleteImage("category-images", c.image_url) : Promise.resolve(),
    ]).catch(() => {});
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Catégorie supprimée");
    setConfirmDel(null);
    qc.invalidateQueries();
  };

  return (
    <AdminPage
      title="Catégories"
      subtitle={`${categories.length} catégorie(s) · ${subs.length} sous-catégorie(s)`}
      actions={
        <>
          <Link to="/admin/subcategories" className={btnSecondary}><Layers className="size-4" /> Sous-catégories</Link>
          <button onClick={() => setEditing("new")} className={btnPrimary}><Plus className="size-4" /> Nouvelle</button>
        </>
      }
    >
      {categories.length === 0 ? (
        <AdminEmpty title="Aucune catégorie" action={<button onClick={() => setEditing("new")} className={btnPrimary}><Plus className="size-4" /> Créer une catégorie</button>}>
          Créez votre première catégorie pour organiser vos produits.
        </AdminEmpty>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => {
            const productCount = products.filter((p) => p.category_id === c.id).length;
            const subCount = subs.filter((s) => s.category_id === c.id).length;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const visible = (c as any).visible !== false;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const banner = (c as any).banner_url as string | null | undefined;
            return (
              <AdminCard key={c.id} className="!p-0 overflow-hidden group">
                <div className="relative aspect-video bg-muted">
                  {c.image_url ? (
                    <img src={c.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">Pas d'image</div>
                  )}
                  {banner && (
                    <div className="absolute bottom-0 inset-x-0 h-8 opacity-80">
                      <img src={banner} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {!visible && <div className="absolute inset-0 bg-black/60 grid place-items-center text-xs font-bold uppercase tracking-widest">Masquée</div>}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold truncate">{c.name_fr}</h3>
                      <p className="text-[11px] text-muted-foreground font-mono truncate">/{c.slug}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{productCount} produit(s)</span>
                    <span>·</span>
                    <span>{subCount} sous-cat.</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button onClick={() => setEditing(c)} className={btnSecondary + " flex-1 !py-2 !px-3 !text-xs"}><Pencil className="size-3.5" /> Modifier</button>
                    <button onClick={() => toggleVisibility(c.id, !visible)} className="p-2 rounded-lg border border-hairline hover:bg-white/5" title={visible ? "Masquer" : "Afficher"}>
                      {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </button>
                    <button onClick={() => setConfirmDel(c)} className="p-2 rounded-lg border border-hairline text-muted-foreground hover:text-destructive hover:border-destructive" title="Supprimer"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}

      {editing && (
        <CategoryEditor
          category={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); qc.invalidateQueries(); }}
        />
      )}

      <ConfirmDialog
        open={!!confirmDel}
        title={`Supprimer « ${confirmDel?.name_fr ?? ""} » ?`}
        description="Les sous-catégories liées seront également supprimées. Cette action est irréversible."
        confirmLabel="Supprimer"
        danger
        onCancel={() => setConfirmDel(null)}
        onConfirm={async () => { if (confirmDel) await del(confirmDel); }}
      />
    </AdminPage>
  );
}

function CategoryEditor({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name_fr: category?.name_fr ?? "",
    name_ar: category?.name_ar ?? "",
    slug: category?.slug ?? "",
    image_url: category?.image_url ?? null as string | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    banner_url: (category as any)?.banner_url ?? null as string | null,
    position: category?.position ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name_fr.trim()) return toast.error("Le nom est requis");
    setSaving(true);
    try {
      const payload = {
        name_fr: form.name_fr.trim(),
        name_ar: form.name_ar.trim() || null,
        slug: (form.slug.trim() || slugify(form.name_fr)) + (category ? "" : "-" + Math.random().toString(36).slice(2, 5)),
        image_url: form.image_url,
        banner_url: form.banner_url,
        position: form.position,
      };
      if (category) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("categories") as any).update(payload).eq("id", category.id);
        if (error) throw error;
        toast.success("Catégorie mise à jour");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("categories") as any).insert(payload);
        if (error) throw error;
        toast.success("Catégorie créée");
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
          <h2 className="font-semibold">{category ? "Modifier la catégorie" : "Nouvelle catégorie"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X className="size-4" /></button>
        </div>
        <div className="p-5 space-y-5">
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
              <label className={labelCls}>Slug (URL)</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} placeholder="auto" />
            </div>
            <div>
              <label className={labelCls}>Ordre d'affichage</label>
              <input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: Number(e.target.value) })} className={inputCls} />
            </div>
          </div>

          <SingleImageUploader
            bucket="category-images"
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
            label="Image de couverture (carrée)"
            aspect="square"
          />
          <SingleImageUploader
            bucket="category-images"
            value={form.banner_url}
            onChange={(url) => setForm({ ...form, banner_url: url })}
            label="Bannière (large)"
            aspect="banner"
          />
        </div>
        <div className="sticky bottom-0 p-4 border-t border-hairline bg-card flex justify-end gap-2">
          <button onClick={onClose} className={btnSecondary}>Annuler</button>
          <button onClick={save} disabled={saving} className={btnPrimary}><Save className="size-4" /> {saving ? "…" : "Enregistrer"}</button>
        </div>
      </div>
    </div>
  );
}
