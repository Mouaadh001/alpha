import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { homepageSectionsQO } from "@/lib/queries";
import floatPs from "@/assets/float-ps.png";
import floatXbox from "@/assets/float-xbox.png";
import floatManette from "@/assets/float-manette.png";
import floatPsConsole from "@/assets/float-ps5-console.png";
import floatXboxConsole from "@/assets/float-xbox-console.png";
import floatXboxS from "@/assets/float-xbox-s.png";
import floatSwitch from "@/assets/float-switch.png";
import heroBg from "@/assets/hero-bg.jpg";

export function GamingHero() {
  const { locale } = useI18n();
  const { data: sections = [] } = useQuery(homepageSectionsQO);
  const cfg = (sections.find((s) => s.section_type === "hero")?.config ?? {}) as Record<string, unknown>;
  const g = (k: string, fb: string) => {
    const v = cfg[locale === "ar" ? `${k}_ar` : `${k}_fr`];
    return typeof v === "string" && v.trim() ? v : fb;
  };
  const title = g("title", locale === "fr" ? "Accessoires Gaming" : "إكسسوارات الألعاب");
  const pill = g("pill", locale === "fr" ? "Boostez votre expérience" : "عزّز تجربتك");
  const desc = g("desc", locale === "fr"
    ? "Découvrez notre gamme d'accessoires gaming indispensables."
    : "اكتشف مجموعتنا من إكسسوارات الألعاب الأساسية.");
  const bgImage = (typeof cfg.bg_image === "string" && cfg.bg_image.trim()) ? String(cfg.bg_image) : heroBg;

  return (
    <section className="relative">
      <div
        className="relative overflow-hidden border-b border-hairline"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
          {/* subtle dark overlay for text contrast */}
          <div aria-hidden className="absolute inset-0 bg-black/30 pointer-events-none" />
          {/* Floating product elements */}
          <img
            src={floatPs}
            alt=""
            aria-hidden
            className="absolute top-4 left-4 md:top-8 md:left-10 w-20 sm:w-28 md:w-36 lg:w-40 animate-float-slow drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            style={{ ["--rot" as string]: "-12deg" } as React.CSSProperties}
          />
          <img
            src={floatXbox}
            alt=""
            aria-hidden
            className="absolute top-4 right-4 md:top-8 md:right-10 w-20 sm:w-28 md:w-36 lg:w-40 animate-float-med drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            style={{ ["--rot" as string]: "10deg" } as React.CSSProperties}
          />
          <img
            src={floatManette}
            alt=""
            aria-hidden
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 sm:w-32 md:w-44 lg:w-52 animate-float-fast drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] opacity-90"
            style={{ ["--rot" as string]: "6deg" } as React.CSSProperties}
          />
          <img
            src={floatPsConsole}
            alt=""
            aria-hidden
            className="absolute bottom-20 -left-6 sm:bottom-24 sm:-left-4 md:bottom-28 md:-left-2 w-[56vw] sm:w-[38vw] md:w-[30vw] lg:w-[28vw] max-w-[34rem] h-auto animate-float-med drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
            style={{ ["--rot" as string]: "-8deg" } as React.CSSProperties}
          />
          <img
            src={floatXboxConsole}
            alt=""
            aria-hidden
            className="absolute bottom-20 right-0 sm:bottom-24 sm:right-2 md:bottom-28 md:right-4 w-[56vw] sm:w-[38vw] md:w-[30vw] lg:w-[28vw] max-w-[34rem] h-auto animate-float-slow drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
            style={{ ["--rot" as string]: "8deg" } as React.CSSProperties}
          />
          <img
            src={floatXboxS}
            alt=""
            aria-hidden
            className="absolute bottom-20 left-1/2 -translate-x-1/2 sm:bottom-24 md:bottom-28 w-[50vw] sm:w-[34vw] md:w-[28vw] lg:w-[26vw] max-w-[30rem] h-auto animate-float-med drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
            style={{ ["--rot" as string]: "4deg" } as React.CSSProperties}
          />
          <img
            src={floatSwitch}
            alt=""
            aria-hidden
            className="absolute top-6 left-1/2 -translate-x-1/2 md:top-10 w-24 sm:w-32 md:w-40 lg:w-48 animate-float-fast drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            style={{ ["--rot" as string]: "-4deg" } as React.CSSProperties}
          />

          {/* Center content — extra bottom padding reserves space for consoles */}
          <div className="relative z-10 min-h-[600px] md:min-h-[760px] flex flex-col items-center justify-center text-center px-6 pt-12 md:pt-20 pb-[60vw] sm:pb-[40vw] md:pb-[30vw] lg:pb-[24rem]">
            <span className="inline-block px-5 py-2 bg-[oklch(0.55_0.24_25)] text-white text-[11px] sm:text-sm font-bold rounded-md shadow-lg">
              {pill}
            </span>
            <h1 className="mt-6 font-display font-black tracking-tight text-foreground text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] max-w-4xl">
              {title}
            </h1>
            <p className="mt-5 text-muted-foreground text-sm sm:text-base md:text-lg max-w-lg">
              {desc}
            </p>
          </div>
      </div>
    </section>
  );
}
