import { createFileRoute, Link } from "@tanstack/react-router";
import { Megaphone, Palette, ExternalLink, KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminPage, AdminCard, inputCls, labelCls } from "@/components/admin/shell";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [saving, setSaving] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 6) return toast.error("Le mot de passe doit faire au moins 6 caractères.");
    if (pwd !== pwd2) return toast.error("Les deux mots de passe ne correspondent pas.");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Mot de passe mis à jour");
    setPwd(""); setPwd2("");
  };

  return (
    <AdminPage title="Paramètres" subtitle="Configuration générale de la boutique">
      <div className="max-w-3xl space-y-6">
        <AdminCard>
          <h2 className="font-semibold mb-1">Boutique</h2>
          <p className="text-xs text-muted-foreground mb-4">Informations générales de la marque.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nom de la boutique</label>
              <input value="Alpha Store" disabled className={inputCls + " opacity-60"} />
            </div>
            <div>
              <label className={labelCls}>Devise</label>
              <input value="Dinar Algérien (DA)" disabled className={inputCls + " opacity-60"} />
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="font-semibold mb-4">Contenu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link to="/admin/announcement" className="flex items-center gap-3 rounded-xl border border-hairline p-4 hover:border-accent transition-colors">
              <div className="size-10 rounded-lg bg-accent/10 text-accent grid place-items-center"><Megaphone className="size-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Bandeau d'annonce</div>
                <div className="text-[11px] text-muted-foreground">Message défilant en haut</div>
              </div>
              <ExternalLink className="size-4 text-muted-foreground" />
            </Link>
            <Link to="/admin/homepage" className="flex items-center gap-3 rounded-xl border border-hairline p-4 hover:border-accent transition-colors">
              <div className="size-10 rounded-lg bg-accent/10 text-accent grid place-items-center"><Palette className="size-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Page d'accueil</div>
                <div className="text-[11px] text-muted-foreground">Éditeur visuel du contenu</div>
              </div>
              <ExternalLink className="size-4 text-muted-foreground" />
            </Link>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="size-4 text-accent" />
            <h2 className="font-semibold">Sécurité</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Changer le mot de passe de votre compte administrateur.</p>
          <form onSubmit={changePassword} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nouveau mot de passe</label>
              <input
                type="password"
                autoComplete="new-password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Minimum 6 caractères"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Confirmer le mot de passe</label>
              <input
                type="password"
                autoComplete="new-password"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                placeholder="Retapez le mot de passe"
                className={inputCls}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving || !pwd || !pwd2}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="size-4 " /> : <KeyRound className="size-4" />}
                {saving ? "Mise à jour…" : "Changer le mot de passe"}
              </button>
            </div>
          </form>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
