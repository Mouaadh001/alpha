import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { allProductsAdminQO, categoriesQO, subcategoriesQO } from "@/lib/queries";
import { formatDA } from "@/lib/format";
import { Trash2, Plus, Search, Filter, Pencil, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { AdminPage, AdminCard, AdminEmpty, ConfirmDialog, inputCls, btnPrimary, btnSecondary } from "@/components/admin/shell";
import { ProductEditorModal } from "@/components/admin/product-editor-modal";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  component: ProductsList,
});

const PAGE_SIZE = 20;

function ProductsList() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery(allProductsAdminQO);
  const { data: categories = [] } = useQuery(categoriesQO);
  const { data: subs = [] } = useQuery(subcategoriesQO);

  const [q, setQ] = useState("");
  const [catId, setCatId] = useState("");
  const [subId, setSubId] = useState("");
  const [stockFilter, setStockFilter] = useState<"" | "in" | "low" | "out">("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDel, setConfirmDel] = useState<{ ids: string[] } | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((p) => p.name_fr.toLowerCase().includes(s) || (p.brand?.toLowerCase() ?? "").includes(s) || (p.sku?.toLowerCase() ?? "").includes(s) || p.slug.includes(s));
    }
    if (catId) list = list.filter((p) => p.category_id === catId);
    if (subId) list = list.filter((p) => p.subcategory_id === subId);
    if (stockFilter === "in") list = list.filter((p) => p.stock > 3);
    if (stockFilter === "low") list = list.filter((p) => p.stock > 0 && p.stock <= 3);
    if (stockFilter === "out") list = list.filter((p) => p.stock === 0);
    if (status === "active") list = list.filter((p) => p.active);
    if (status === "inactive") list = list.filter((p) => !p.active);
    return list;
  }, [products, q, catId, subId, stockFilter, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const availableSubs = subs.filter((s) => !catId || s.category_id === catId);

  const deleteMany = async (ids: string[]) => {
    const { error } = await supabase.from("products").delete().in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`${ids.length} produit(s) supprimé(s)`);
    setSelected(new Set());
    setConfirmDel(null);
    qc.invalidateQueries();
  };

  const setActive = async (ids: string[], active: boolean) => {
    const { error } = await supabase.from("products").update({ active }).in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(active ? "Activé(s)" : "Désactivé(s)");
    setSelected(new Set());
    qc.invalidateQueries();
  };

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = paged.length > 0 && paged.every((p) => selected.has(p.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(paged.map((p) => p.id)));
  };

  return (
    <AdminPage
      title="Produits"
      subtitle={`${filtered.length} produit(s)`}
      actions={<button onClick={() => setNewOpen(true)} className={btnPrimary}><Plus className="size-4" /> Nouveau</button>}
    >
      {/* Search + filter toggle */}
      <AdminCard className="!p-3 md:!p-4 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input placeholder="Rechercher…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className={inputCls + " pl-10 !py-3"} />
          </div>
          <button onClick={() => setShowFilters((s) => !s)} className={btnSecondary + " shrink-0"}>
            <Filter className="size-4" /><span className="hidden sm:inline">Filtres</span>
          </button>
        </div>
        {/* Category chips — quick filter */}
        <div className="mt-3 -mx-1 px-1 flex gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => { setCatId(""); setSubId(""); setPage(1); }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${catId === "" ? "bg-accent text-accent-foreground border-accent" : "border-hairline text-muted-foreground hover:text-foreground"}`}
          >
            Toutes ({products.length})
          </button>
          {categories.map((c) => {
            const count = products.filter((p) => p.category_id === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => { setCatId(c.id); setSubId(""); setPage(1); }}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${catId === c.id ? "bg-accent text-accent-foreground border-accent" : "border-hairline text-muted-foreground hover:text-foreground"}`}
              >
                {c.name_fr} ({count})
              </button>
            );
          })}
        </div>
        {catId && availableSubs.length > 0 && (
          <div className="mt-2 -mx-1 px-1 flex gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => { setSubId(""); setPage(1); }}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${subId === "" ? "bg-foreground/10 border-foreground/20" : "border-hairline text-muted-foreground hover:text-foreground"}`}
            >
              Toutes sous-cat.
            </button>
            {availableSubs.map((s) => {
              const count = products.filter((p) => p.subcategory_id === s.id).length;
              return (
                <button
                  key={s.id}
                  onClick={() => { setSubId(s.id); setPage(1); }}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors whitespace-nowrap ${subId === s.id ? "bg-foreground/10 border-foreground/20" : "border-hairline text-muted-foreground hover:text-foreground"}`}
                >
                  {s.name_fr} ({count})
                </button>
              );
            })}
          </div>
        )}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-hairline grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select value={catId} onChange={(e) => { setCatId(e.target.value); setSubId(""); setPage(1); }} className={inputCls}>
              <option value="">Toutes catégories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name_fr}</option>)}
            </select>
            <select value={subId} onChange={(e) => { setSubId(e.target.value); setPage(1); }} className={inputCls} disabled={!catId}>
              <option value="">Toutes sous-cat.</option>
              {availableSubs.map((s) => <option key={s.id} value={s.id}>{s.name_fr}</option>)}
            </select>
            <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value as typeof stockFilter); setPage(1); }} className={inputCls}>
              <option value="">Tout stock</option>
              <option value="in">En stock</option>
              <option value="low">Stock faible</option>
              <option value="out">Rupture</option>
            </select>
            <select value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }} className={inputCls}>
              <option value="">Tous statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        )}
      </AdminCard>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="mb-3 rounded-xl bg-accent/10 border border-accent/40 px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold">{selected.size} sélectionné(s)</span>
          <div className="flex-1" />
          <button onClick={() => setActive([...selected], true)} className="text-xs font-semibold hover:text-accent flex items-center gap-1"><Eye className="size-3.5" /> Activer</button>
          <button onClick={() => setActive([...selected], false)} className="text-xs font-semibold hover:text-accent flex items-center gap-1"><EyeOff className="size-3.5" /> Désactiver</button>
          <button onClick={() => setConfirmDel({ ids: [...selected] })} className="text-xs font-semibold text-destructive hover:opacity-80 flex items-center gap-1"><Trash2 className="size-3.5" /> Supprimer</button>
        </div>
      )}

      {filtered.length === 0 ? (
        <AdminEmpty title={products.length === 0 ? "Aucun produit" : "Aucun résultat"} action={<button onClick={() => setNewOpen(true)} className={btnPrimary}><Plus className="size-4" /> Ajouter un produit</button>}>
          {products.length === 0 ? "Commencez par ajouter votre premier produit." : "Ajustez les filtres pour voir d'autres produits."}
        </AdminEmpty>
      ) : (
        <>
          {/* Desktop table */}
          <AdminCard className="!p-0 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th className="p-3 w-10"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                    <th className="p-3 w-14"></th>
                    <th className="p-3">Produit</th>
                    <th className="p-3">Catégorie</th>
                    <th className="p-3">Prix</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p) => {
                    const cat = categories.find((c) => c.id === p.category_id);
                    const cover = p.cover_image ?? p.image_url;
                    return (
                      <tr key={p.id} className="border-b border-hairline last:border-b-0 hover:bg-white/[0.02] transition-colors">
                        <td className="p-3"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} /></td>
                        <td className="p-3"><div className="size-11 rounded-lg bg-muted overflow-hidden">{cover && <img src={cover} alt="" className="w-full h-full object-cover" />}</div></td>
                        <td className="p-3 min-w-[200px]">
                          <Link to="/admin/products/$id" params={{ id: p.id }} className="font-medium hover:text-accent">{p.name_fr}</Link>
                          <div className="text-[11px] text-muted-foreground font-mono truncate">{p.sku ?? p.slug}</div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{cat?.name_fr ?? "—"}</td>
                        <td className="p-3 font-mono text-xs">{formatDA(p.price_da)}</td>
                        <td className={`p-3 font-mono text-xs ${p.stock === 0 ? "text-destructive" : p.stock <= 3 ? "text-amber-400" : ""}`}>{p.stock}</td>
                        <td className="p-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.active ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-muted-foreground"}`}>{p.active ? "Actif" : "Inactif"}</span></td>
                        <td className="p-3">
                          <div className="flex justify-end gap-1">
                            <Link to="/admin/products/$id" params={{ id: p.id }} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-accent" title="Modifier"><Pencil className="size-4" /></Link>
                            <button onClick={() => setConfirmDel({ ids: [p.id] })} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-destructive" title="Supprimer"><Trash2 className="size-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </AdminCard>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {paged.map((p) => {
              const cat = categories.find((c) => c.id === p.category_id);
              const cover = p.cover_image ?? p.image_url;
              return (
                <div key={p.id} className="rounded-xl border border-hairline bg-card p-3 flex gap-3">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="mt-1.5" />
                  <div className="size-16 rounded-lg bg-muted overflow-hidden shrink-0">{cover && <img src={cover} alt="" className="w-full h-full object-cover" />}</div>
                  <div className="flex-1 min-w-0">
                    <Link to="/admin/products/$id" params={{ id: p.id }} className="font-semibold text-sm truncate block">{p.name_fr}</Link>
                    <div className="text-[11px] text-muted-foreground truncate">{cat?.name_fr ?? "—"}</div>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold">{formatDA(p.price_da)}</span>
                      <span className={`text-[10px] font-mono ${p.stock === 0 ? "text-destructive" : p.stock <= 3 ? "text-amber-400" : "text-muted-foreground"}`}>Stock: {p.stock}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p.active ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-muted-foreground"}`}>{p.active ? "Actif" : "Inactif"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Link to="/admin/products/$id" params={{ id: p.id }} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground"><Pencil className="size-4" /></Link>
                    <button onClick={() => setConfirmDel({ ids: [p.id] })} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Page {page} sur {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={btnSecondary + " !py-1.5 !px-3"}>Précédent</button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className={btnSecondary + " !py-1.5 !px-3"}>Suivant</button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!confirmDel}
        title="Supprimer ce(s) produit(s) ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        danger
        onCancel={() => setConfirmDel(null)}
        onConfirm={async () => { if (confirmDel) await deleteMany(confirmDel.ids); }}
      />

      <ProductEditorModal open={newOpen} onClose={() => setNewOpen(false)} />
    </AdminPage>
  );
}