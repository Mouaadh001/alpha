import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, Menu, X, ArrowRight, Sun, Moon, ChevronRight, ChevronDown } from "lucide-react";
import { Instagram, Facebook } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useI18n, useT } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useQuery } from "@tanstack/react-query";
import { categoriesQO, subcategoriesQO } from "@/lib/queries";
import alphaLogo from "@/assets/alpha-logo.webp";

const INSTAGRAM_URL = "https://www.instagram.com/alpha.store.eleulma?igsh=MW9rNmlqZGRleDZ2aA==";
const FACEBOOK_URL = "https://www.facebook.com/share/196VyBTVGN/?mibextid=wwXIfr";
const TIKTOK_URL = "https://www.tiktok.com/@alpha.store.eleulma?_r=1&_t=ZT-97iO0hjOICk";

function DrawerTikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.5 6.5a5.6 5.6 0 0 1-3.4-1.2 5.6 5.6 0 0 1-2.1-3.8h-3v13.1a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V8.9a5.9 5.9 0 0 0-.8-.1 5.8 5.8 0 1 0 5.8 5.8V9.1a8.6 8.6 0 0 0 5.4 1.9V8a5.4 5.4 0 0 1 0-1.5Z"/>
    </svg>
  );
}

export function SiteHeader() {
  const { count } = useCart();
  const { locale, setLocale } = useI18n();
  const { theme, toggle: toggleTheme } = useTheme();
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuQuery, setMenuQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: categories = [] } = useQuery(categoriesQO);
  const { data: subcategories = [] } = useQuery(subcategoriesQO);

  useEffect(() => {
    // preload session listener kept elsewhere; header no longer needs account state
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, searchOpen]);

  const filteredCats = query
    ? categories.filter((c) =>
        (c.name_fr + " " + (c.name_ar ?? "")).toLowerCase().includes(query.toLowerCase())
      )
    : [];
  const filteredSubs = query
    ? subcategories.filter((s) =>
        (s.name_fr + " " + (s.name_ar ?? "")).toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-hairline">
        <div className="max-w-[1600px] mx-auto px-3 md:px-5 h-14 grid grid-cols-3 items-center gap-2">
          {/* Left — theme toggle + mobile menu */}
          <div className="flex items-center gap-3 md:gap-4 justify-self-start">
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden text-foreground/80 hover:text-lime"
              aria-label={t.categories}
            >
              <Menu className="size-5" />
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="hidden md:flex items-center gap-2 text-sm font-semibold tracking-tight text-muted-foreground hover:text-lime transition-colors"
            >
              <Menu className="size-4" /> {t.categories}
            </button>
            <button
              onClick={toggleTheme}
              aria-label="Theme"
              className="text-foreground/80 hover:text-lime transition-colors"
            >
              {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </button>
          </div>

          {/* Center — logo */}
          <Link to="/" className="justify-self-center flex items-center" aria-label="Alpha Store">
            <img src={alphaLogo} alt="Alpha Store" decoding="async" className="h-16 md:h-20 w-auto object-contain -my-4" />
          </Link>

          {/* Right — search + cart */}
          <div className="flex items-center gap-4 md:gap-5 justify-self-end">
            <button
              onClick={() => setLocale(locale === "fr" ? "ar" : "fr")}
              aria-label="Language"
              className="text-[11px] font-mono font-bold tracking-widest text-foreground/80 hover:text-lime transition-colors"
            >
              {locale === "fr" ? "AR" : "FR"}
            </button>
            <Link to="/cart" className="hidden" aria-label={t.cart}>
              <ShoppingBag className="size-[18px]" />
              {count > 0 && (
                <span className="absolute -top-2 -end-2 bg-lime text-lime-foreground text-[9px] font-bold size-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl ">
          <div className="max-w-[1600px] mx-auto px-6 py-6 flex items-center justify-between border-b border-hairline">
            <span className="eyebrow">{t.search}</span>
            <button onClick={() => { setSearchOpen(false); setQuery(""); }} className="text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
          </div>
          <div className="max-w-3xl mx-auto px-6 py-16">
            <div className="flex items-center gap-4 border-b-2 border-lime pb-4">
              <Search className="size-6 text-lime" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={locale === "fr" ? "Rechercher une catégorie, une marque…" : "ابحث عن فئة أو علامة…"}
                className="flex-1 bg-transparent text-2xl md:text-4xl font-display font-bold uppercase tracking-tight focus:outline-none placeholder:text-muted-foreground/40"
              />
            </div>
            {query && (filteredCats.length > 0 || filteredSubs.length > 0) && (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <span className="eyebrow mb-4 block">{t.categories}</span>
                  <ul className="space-y-2">
                    {filteredCats.map((c) => (
                      <li key={c.id}>
                        <Link
                          to="/category/$slug"
                          params={{ slug: c.slug }}
                          onClick={() => { setSearchOpen(false); setQuery(""); }}
                          className="group flex items-center justify-between py-3 border-b border-hairline hover:border-lime"
                        >
                          <span className="font-display font-bold uppercase">{c.name_fr}</span>
                          <ArrowRight className="size-4 text-muted-foreground group-hover:text-lime group-hover:translate-x-1 transition" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="eyebrow mb-4 block">{t.subcategories}</span>
                  <ul className="space-y-2">
                    {filteredSubs.map((s) => {
                      const cat = categories.find((c) => c.id === s.category_id);
                      if (!cat) return null;
                      return (
                        <li key={s.id}>
                          <Link
                            to="/category/$slug/$sub"
                            params={{ slug: cat.slug, sub: s.slug }}
                            onClick={() => { setSearchOpen(false); setQuery(""); }}
                            className="group flex items-center justify-between py-3 border-b border-hairline hover:border-lime"
                          >
                            <span className="text-sm">{s.name_fr} <span className="text-muted-foreground text-xs ms-2">· {cat.name_fr}</span></span>
                            <ArrowRight className="size-4 text-muted-foreground group-hover:text-lime group-hover:translate-x-1 transition" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
            {query && filteredCats.length === 0 && filteredSubs.length === 0 && (
              <p className="mt-12 text-muted-foreground text-sm">
                {locale === "fr" ? "Aucun résultat pour" : "لا نتائج لـ"} “{query}”.
              </p>
            )}
            {!query && (
              <div className="mt-12">
                <span className="eyebrow mb-4 block">{locale === "fr" ? "Suggestions" : "اقتراحات"}</span>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 10).map((c) => (
                    <Link
                      key={c.id}
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      onClick={() => setSearchOpen(false)}
                      className="px-4 py-2 border border-hairline text-xs uppercase tracking-widest hover:border-lime hover:text-lime transition"
                    >
                      {c.name_fr}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-in drawer menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[70] flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm "
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative w-[85%] max-w-sm h-full bg-background border-e border-hairline shadow-2xl flex flex-col animate-slide-in-left">
            <div className="flex items-center justify-between px-5 h-14 border-b border-hairline">
              <img src={alphaLogo} alt="Alpha Store" loading="lazy" decoding="async" className="h-9 w-auto" />
              <button
                onClick={() => setMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Search input */}
            <div className="px-5 py-4 border-b border-hairline">
              <div className="flex items-center gap-3 px-3 h-11 rounded-full border border-hairline bg-muted/30">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={menuQuery}
                  onChange={(e) => setMenuQuery(e.target.value)}
                  placeholder={locale === "fr" ? "Rechercher un produit" : "ابحث عن منتج"}
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Category list */}
            <nav className="flex-1 overflow-y-auto">
              {categories.map((c) => {
                const subs = subcategories.filter((s) => s.category_id === c.id);
                const name = locale === "ar" && c.name_ar ? c.name_ar : c.name_fr;
                const hasSubs = subs.length > 0;
                const isOpen = expanded === c.id;
                return (
                  <div key={c.id} className="border-b border-hairline">
                    <div className="flex items-stretch">
                      <Link
                        to="/category/$slug"
                        params={{ slug: c.slug }}
                        onClick={() => setMenuOpen(false)}
                        className="flex-1 px-5 py-4 text-[15px] font-semibold uppercase tracking-wide hover:text-lime transition-colors"
                      >
                        {name}
                      </Link>
                      {hasSubs && (
                        <button
                          onClick={() => setExpanded(isOpen ? null : c.id)}
                          className="px-5 border-s border-hairline text-muted-foreground hover:text-foreground"
                          aria-label="Toggle"
                        >
                          {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                        </button>
                      )}
                    </div>
                    {hasSubs && isOpen && (
                      <ul className="bg-muted/20">
                        {subs.map((s) => (
                          <li key={s.id}>
                            <Link
                              to="/category/$slug/$sub"
                              params={{ slug: c.slug, sub: s.slug }}
                              onClick={() => setMenuOpen(false)}
                              className="block px-8 py-3 text-sm text-muted-foreground hover:text-lime transition-colors"
                            >
                              {locale === "ar" && s.name_ar ? s.name_ar : s.name_fr}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Locale switch */}
            <div className="flex items-center justify-center gap-3 px-5 h-12 border-t border-hairline text-xs font-mono">
              <button onClick={() => setLocale("fr")} className={locale === "fr" ? "text-lime" : "text-muted-foreground"}>FR</button>
              <span className="text-muted-foreground">/</span>
              <button onClick={() => setLocale("ar")} className={locale === "ar" ? "text-lime" : "text-muted-foreground"}>AR</button>
            </div>

            {/* Social links */}
            <div className="flex items-center justify-center gap-3 px-5 h-14 border-t border-hairline">
              {[
                { i: Instagram, l: "Instagram", href: INSTAGRAM_URL },
                { i: Facebook, l: "Facebook", href: FACEBOOK_URL },
                { i: DrawerTikTokIcon, l: "TikTok", href: TIKTOK_URL },
              ].map(({ i: Icon, l, href }) => (
                <a
                  key={l}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l}
                  className="size-9 rounded-full border border-hairline grid place-items-center text-foreground/80 hover:text-lime hover:border-lime transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
