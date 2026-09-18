import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import promoBand from "@/assets/promo-band.jpg";

export function Newsletter() {
  const { locale } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Local-only placeholder; hook to a table when needed.
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    setEmail("");
    toast.success(locale === "fr" ? "Inscription confirmée." : "تم الاشتراك.");
  };

  return (
    <section className="relative overflow-hidden border-y border-hairline">
      <img
        src={promoBand}
        alt=""
        loading="lazy"
        width={1920}
        height={700}
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/30" />
      <div className="relative max-w-[1600px] mx-auto px-6 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="eyebrow text-lime">\\ Newsletter</span>
          <h2 className="font-display font-bold text-4xl md:text-5xl mt-4 uppercase tracking-tight leading-[0.95]">
            {locale === "fr" ? (<>Les drops avant<br/>tout le monde.</>) : (<>الوصولات الجديدة<br/>قبل الجميع.</>)}
          </h2>
          <p className="text-muted-foreground mt-6 max-w-md">
            {locale === "fr"
              ? "Rejoignez la liste privée d'Alpha Store et recevez les nouveaux drops, précommandes et offres exclusives avant leur mise en ligne."
              : "انضم إلى القائمة الخاصة لـ Alpha Store."}
          </p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="flex bg-surface/80 backdrop-blur border border-hairline">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={locale === "fr" ? "votre@email.com" : "بريدك الإلكتروني"}
              className="flex-1 bg-transparent px-5 py-4 text-sm focus:outline-none"
            />
            <button type="submit" disabled={loading} className="btn-lime rounded-none disabled:opacity-50">
              {loading ? "…" : locale === "fr" ? "S'inscrire" : "اشترك"}
            </button>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {locale === "fr" ? "Aucun spam · Désabonnement en 1 clic" : "بدون رسائل مزعجة"}
          </p>
        </form>
      </div>
    </section>
  );
}