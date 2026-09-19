import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { productByFamilyFirstQO, homepageSectionsQO } from "@/lib/queries";
import ps5 from "@/assets/float-ps5-console.webp";
import ps4 from "@/assets/console-ps4.webp";
import xboxX from "@/assets/float-xbox-console.webp";
import xboxS from "@/assets/float-xbox-s.webp";

type Item = {
  key: string;
  title: string;
  image: string;
  bullets: { fr: string; ar: string }[];
  familyKey: string;
  bg: string;
  float: string;
};

const ITEMS: Item[] = [
  {
    key: "ps5",
    title: "PLAYSTATION 5",
    image: ps5,
    familyKey: "ps5",
    bg: "from-[#3ec6ff] to-[#66d4ff]",
    float: "animate-float-slow",
    bullets: [
      { fr: "Sortie : Novembre 2020", ar: "الإصدار: نوفمبر 2020" },
      { fr: "Fabricant : Sony", ar: "الصانع: سوني" },
      { fr: "9ᵉ génération de consoles", ar: "الجيل التاسع" },
      { fr: "Version Standard (lecteur disque)", ar: "الإصدار العادي (بقارئ أقراص)" },
    ],
  },
  {
    key: "ps4",
    title: "PLAYSTATION 4",
    image: ps4,
    familyKey: "ps4",
    bg: "from-[#3ec6ff] to-[#66d4ff]",
    float: "animate-float-med",
    bullets: [
      { fr: "Sortie : Septembre 2016", ar: "الإصدار: سبتمبر 2016" },
      { fr: "Fabricant : Sony", ar: "الصانع: سوني" },
      { fr: "Version optimisée de la PS4", ar: "نسخة محسّنة من PS4" },
      { fr: "Console fiable et accessible", ar: "كونسول موثوق وبسعر مناسب" },
    ],
  },
  {
    key: "xbox-x",
    title: "XBOX SERIES X",
    image: xboxX,
    familyKey: "xbox-series-x",
    bg: "from-[#3ec6ff] to-[#66d4ff]",
    float: "animate-float-fast",
    bullets: [
      { fr: "Sortie : Novembre 2020", ar: "الإصدار: نوفمبر 2020" },
      { fr: "Fabricant : Microsoft", ar: "الصانع: مايكروسوفت" },
      { fr: "9ᵉ génération de consoles", ar: "الجيل التاسع" },
      { fr: "La Xbox la plus puissante", ar: "أقوى كونسول Xbox" },
    ],
  },
  {
    key: "xbox-s",
    title: "XBOX SERIES S",
    image: xboxS,
    familyKey: "xbox-series-s",
    bg: "from-[#3ec6ff] to-[#66d4ff]",
    float: "animate-float-med",
    bullets: [
      { fr: "Sortie : Novembre 2020", ar: "الإصدار: نوفمبر 2020" },
      { fr: "Fabricant : Microsoft", ar: "الصانع: مايكروسوفت" },
      { fr: "9ᵉ génération de consoles", ar: "الجيل التاسع" },
      { fr: "Version compacte 100% digitale", ar: "نسخة مضغوطة رقمية 100%" },
    ],
  },
];

export function TopConsoles() {
  const { locale } = useI18n();
  const { data: sections = [] } = useQuery(homepageSectionsQO);
  const cfg = (sections.find((s) => s.section_type === "top_consoles")?.config ?? {}) as Record<string, unknown>;
  const override = (key: string) => {
    const v = cfg[`image_${key.replace("-", "_")}`];
    return typeof v === "string" && v ? v : null;
  };
  const items = ITEMS.map((it) => ({ ...it, image: override(it.key) ?? it.image }));
  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-6 pt-8 md:pt-14">
      <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight mb-5 md:mb-8">
        {locale === "fr" ? "Top des consoles" : "أفضل الكونسولات"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {items.map((it) => <ConsoleCard key={it.key} item={it} locale={locale} />)}
      </div>
    </section>
  );
}

function ConsoleCard({ item: it, locale }: { item: Item; locale: string }) {
  const { data: firstProduct } = useQuery(productByFamilyFirstQO(it.familyKey));
  return (
          <article
            className={`relative rounded-3xl overflow-hidden bg-gradient-to-b ${it.bg} p-6 md:p-8 text-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.4)]`}
          >
            <div className="relative h-64 md:h-72 flex items-center justify-center">
              <img
                src={it.image}
                alt={it.title}
                loading="lazy"
                decoding="async"
                className={`max-h-full max-w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)] ${it.float}`}
              />
            </div>
            <h3 className="mt-4 font-display font-extrabold text-2xl md:text-3xl tracking-tight text-center">
              {it.title}
            </h3>
            <ul className="mt-5 space-y-3">
              {it.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] md:text-base font-medium">
                  <span className="mt-0.5 grid place-items-center size-6 rounded-full bg-red-600 shadow-md shrink-0">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  <span>{locale === "ar" ? b.ar : b.fr}</span>
                </li>
              ))}
            </ul>
            {firstProduct ? (
              <Link
                to="/product/$slug"
                params={{ slug: firstProduct.slug }}
                search={{ family: 1 }}
                className="mt-6 w-full h-14 rounded-full bg-red-600 hover:bg-red-500 active:scale-[0.99] transition text-white font-display font-extrabold text-lg tracking-wide flex items-center justify-center shadow-[0_10px_25px_-10px_rgba(220,38,38,0.7)]"
              >
                {locale === "fr" ? "COMMANDEZ MAINTENANT" : "اطلب الآن"}
              </Link>
            ) : (
              <div className="mt-6 w-full h-14 rounded-full bg-red-600/50 text-white/70 font-display font-extrabold text-lg tracking-wide flex items-center justify-center cursor-not-allowed">
                {locale === "fr" ? "BIENTÔT DISPONIBLE" : "قريباً"}
              </div>
            )}
          </article>
  );
}
