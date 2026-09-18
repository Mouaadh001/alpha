import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import heroPs5 from "@/assets/hero-ps5.jpg";
import heroVr from "@/assets/hero-vr.jpg";
import heroEsports from "@/assets/hero-esports.jpg";

type Slide = {
  image: string;
  eyebrow: { fr: string; ar: string };
  title: { fr: string; ar: string };
  body: { fr: string; ar: string };
  cta: { fr: string; ar: string };
  ctaSlug: string;
  accent?: string;
};

const SLIDES: Slide[] = [
  {
    image: heroPs5,
    eyebrow: { fr: "Nouvelle génération", ar: "الجيل الجديد" },
    title: { fr: "PLAY.\nDIFFERENT.", ar: "العب.\nباختلاف." },
    body: {
      fr: "PlayStation 5 Pro, Xbox Series X, Nintendo Switch 2 — l'élite du gaming, livrée à votre porte partout en Algérie.",
      ar: "بلايستيشن 5 برو، إكس بوكس، نينتندو سويتش 2 — نخبة الألعاب توصل إلى بابك.",
    },
    cta: { fr: "Découvrir PlayStation", ar: "اكتشف بلايستيشن" },
    ctaSlug: "playstation",
  },
  {
    image: heroVr,
    eyebrow: { fr: "Réalité virtuelle", ar: "الواقع الافتراضي" },
    title: { fr: "STEP\nINSIDE.", ar: "ادخل\nإلى الداخل." },
    body: {
      fr: "Meta Quest 3, PSVR2, accessoires haptiques. Immersion sans compromis, pour joueurs exigeants.",
      ar: "ميتا كويست 3، بي إس في آر 2، ملحقات لمسية. انغماس بلا حدود.",
    },
    cta: { fr: "Explorer la VR", ar: "اكتشف الواقع الافتراضي" },
    ctaSlug: "vr",
  },
  {
    image: heroEsports,
    eyebrow: { fr: "Esports gear", ar: "معدات الرياضات الإلكترونية" },
    title: { fr: "BUILT TO\nCOMPETE.", ar: "صُنع\nللمنافسة." },
    body: {
      fr: "Casques, claviers, souris et volants signés Razer, Logitech, Thrustmaster. Précision millimétrée.",
      ar: "سماعات، لوحات مفاتيح، فأرات وعجلات من رايزر ولوجيتك.",
    },
    cta: { fr: "Voir les accessoires", ar: "عرض الملحقات" },
    ctaSlug: "accessoires",
  },
];

export function HeroSlider() {
  const { locale } = useI18n();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative border-b border-hairline bg-black overflow-hidden">
      <div className="relative min-h-[78vh] lg:min-h-[86vh] grid grid-cols-1 lg:grid-cols-12">
        {/* Image stage */}
        <div className="lg:col-span-7 relative overflow-hidden border-e border-hairline">
          {SLIDES.map((s, i) => (
            <img
              key={s.image}
              src={s.image}
              alt=""
              width={1600}
              height={1000}
              loading={i === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1400ms] ease-out ${
                i === active ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/70 lg:to-background" />
          <div className="absolute bottom-6 start-6 flex items-center gap-6 z-10">
            <span className="font-mono text-[10px] tracking-[0.3em] text-lime uppercase">
              {String(active + 1).padStart(2, "0")} <span className="text-muted-foreground">/ {String(SLIDES.length).padStart(2, "0")}</span>
            </span>
            <div className="flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-[2px] transition-all duration-500 ${i === active ? "w-10 bg-lime" : "w-5 bg-white/25 hover:bg-white/60"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Copy stage */}
        <div className="lg:col-span-5 relative flex flex-col justify-center p-8 md:p-14 lg:p-16 bg-background">
          {SLIDES.map((s, i) => (
            <div
              key={i}
              className={`transition-all duration-700 ease-out ${
                i === active ? "opacity-100 translate-y-0 relative" : "opacity-0 translate-y-4 absolute inset-0 p-8 md:p-14 lg:p-16 pointer-events-none"
              }`}
            >
              <span className="eyebrow text-lime mb-6 block">\\ {s.eyebrow[locale]}</span>
              <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-tight mb-8 whitespace-pre-line">
                {s.title[locale]}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-md">{s.body[locale]}</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/category/$slug" params={{ slug: s.ctaSlug }} className="btn-lime">
                  {s.cta[locale]}
                </Link>
                <Link to="/category/$slug" params={{ slug: "jeux" }} className="btn-ghost">
                  {locale === "fr" ? "Voir les jeux" : "عرض الألعاب"}
                </Link>
              </div>
            </div>
          ))}
          <div className="mt-14 border-t border-hairline pt-6 grid grid-cols-3 gap-0">
            {[
              { n: "58", l: locale === "fr" ? "Wilayas" : "ولاية" },
              { n: "24h", l: locale === "fr" ? "Expédition" : "شحن" },
              { n: "2y", l: locale === "fr" ? "Garantie" : "ضمان" },
            ].map((s) => (
              <div key={s.n} className="border-e border-hairline last:border-e-0 pe-4">
                <div className="font-display font-bold text-2xl tracking-tight">{s.n}</div>
                <div className="eyebrow mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}