import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { announcementBarQO } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/announcement")({
  component: AnnouncementAdmin,
});

function AnnouncementAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery(announcementBarQO);
  const [form, setForm] = useState({
    enabled: true,
    text_fr: "",
    text_ar: "",
    speed_seconds: 40,
    bg_color: "#0A0A0A",
    text_color: "#C6FF3D",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("announcement_bar")
      .update({
        enabled: form.enabled,
        text_fr: form.text_fr,
        text_ar: form.text_ar,
        speed_seconds: form.speed_seconds,
        bg_color: form.bg_color,
        text_color: form.text_color,
        updated_at: new Date().toISOString(),
      })
      .eq("id", true);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Barre d'annonce enregistrée");
    qc.invalidateQueries({ queryKey: ["announcement_bar"] });
  };

  const input = "w-full bg-surface border border-hairline px-3 py-2 text-sm focus:outline-none focus:border-lime";
  const label = "eyebrow block mb-2";

  return (
    <div className="max-w-3xl">
      <span className="eyebrow text-lime">\\ Marketing</span>
      <h1 className="font-display font-bold text-4xl mt-3 mb-10 uppercase tracking-tight">Barre d'annonce</h1>

      {/* Live preview */}
      <div className="border border-hairline mb-8 overflow-hidden">
        <div className="p-3 border-b border-hairline flex items-center justify-between">
          <span className="eyebrow">Aperçu</span>
          <span className="text-[10px] font-mono text-muted-foreground">{form.enabled ? "ACTIF" : "DÉSACTIVÉ"}</span>
        </div>
        <div
          className="w-full overflow-hidden relative"
          style={{ backgroundColor: form.bg_color, color: form.text_color, height: 36 }}
        >
          {form.enabled && (
            <div
              className="flex items-center h-full whitespace-nowrap"
              style={{ animation: `alpha-marquee ${Math.max(10, form.speed_seconds)}s linear infinite` }}
            >
              {Array.from({ length: 3 }).flatMap((_, k) =>
                (form.text_fr || "").split(/·|\|/).map((s) => s.trim()).filter(Boolean).map((it, i) => (
                  <span key={`${k}-${i}`} className="inline-flex items-center gap-3 px-6 text-[11px] font-mono uppercase tracking-[0.18em]">
                    {it}<span className="opacity-40">◆</span>
                  </span>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={save} className="space-y-6 border border-hairline p-6">
        <label className="flex items-center justify-between text-sm cursor-pointer border-b border-hairline pb-4">
          <span className="font-bold uppercase tracking-widest text-xs">Activer la barre</span>
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
        </label>

        <div>
          <label className={label}>Texte (Français)</label>
          <textarea
            rows={3}
            value={form.text_fr}
            onChange={(e) => setForm({ ...form, text_fr: e.target.value })}
            className={input}
            placeholder="Séparez les messages par ·"
          />
          <p className="text-[10px] text-muted-foreground mt-1 font-mono">Utilisez « · » ou « | » pour séparer les messages.</p>
        </div>

        <div>
          <label className={label}>Texte (العربية)</label>
          <textarea
            rows={3}
            value={form.text_ar}
            onChange={(e) => setForm({ ...form, text_ar: e.target.value })}
            className={input}
            dir="rtl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={label}>Vitesse (secondes)</label>
            <input
              type="number"
              min={10}
              max={200}
              value={form.speed_seconds}
              onChange={(e) => setForm({ ...form, speed_seconds: Number(e.target.value) })}
              className={input}
            />
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">Plus grand = plus lent</p>
          </div>
          <div>
            <label className={label}>Fond</label>
            <div className="flex gap-2">
              <input type="color" value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} className="h-10 w-14 bg-surface border border-hairline" />
              <input type="text" value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} className={input + " flex-1 font-mono"} />
            </div>
          </div>
          <div>
            <label className={label}>Texte</label>
            <div className="flex gap-2">
              <input type="color" value={form.text_color} onChange={(e) => setForm({ ...form, text_color: e.target.value })} className="h-10 w-14 bg-surface border border-hairline" />
              <input type="text" value={form.text_color} onChange={(e) => setForm({ ...form, text_color: e.target.value })} className={input + " flex-1 font-mono"} />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-hairline">
          <button type="submit" disabled={saving} className="btn-lime disabled:opacity-50">
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}