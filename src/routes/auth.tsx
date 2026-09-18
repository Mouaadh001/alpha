import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site-shell";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Connexion — Alpha Store" }] }),
  component: AuthPage,
  errorComponent: ({ error }) => <SiteShell><div className="p-12">{error.message}</div></SiteShell>,
  notFoundComponent: () => <SiteShell><div className="p-12">Introuvable</div></SiteShell>,
});

function AuthPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success(locale === "fr" ? "Compte créé. Redirection…" : "تم إنشاء الحساب.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteShell>
      <div className="max-w-md mx-auto px-6 py-16">
        <span className="eyebrow text-lime">{"\\ Alpha"}</span>
        <h1 className="font-display font-bold text-4xl mt-3 mb-8 uppercase tracking-tight">
          {mode === "signin"
            ? (locale === "fr" ? "Connexion" : "تسجيل الدخول")
            : (locale === "fr" ? "Créer un compte" : "إنشاء حساب")}
        </h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="eyebrow block mb-2">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-hairline px-4 py-3 text-sm focus:outline-none focus:border-lime" />
          </div>
          <div>
            <label className="eyebrow block mb-2">{locale === "fr" ? "Mot de passe" : "كلمة السر"}</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-hairline px-4 py-3 text-sm focus:outline-none focus:border-lime" />
          </div>
          <button type="submit" disabled={loading} className="btn-lime w-full disabled:opacity-50">
            {loading ? "…" : mode === "signin" ? (locale === "fr" ? "Se connecter" : "دخول") : (locale === "fr" ? "S'inscrire" : "تسجيل")}
          </button>
        </form>
        <button
          onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          className="w-full mt-6 text-xs uppercase tracking-widest text-muted-foreground hover:text-lime"
        >
          {mode === "signin"
            ? (locale === "fr" ? "Pas de compte ? Créer un compte →" : "ليس لديك حساب؟ إنشاء →")
            : (locale === "fr" ? "← Déjà un compte ? Se connecter" : "← لديك حساب؟ دخول")}
        </button>
        <p className="text-[10px] text-muted-foreground text-center mt-8 font-mono tracking-widest uppercase">
          {locale === "fr" ? "Réservé aux administrateurs" : "للمسؤولين فقط"}
        </p>
      </div>
    </SiteShell>
  );
}