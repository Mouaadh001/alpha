import { Link } from "@tanstack/react-router";
import { useT, useI18n } from "@/lib/i18n";
import { Instagram, Facebook } from "lucide-react";
import alphaLogo from "@/assets/alpha-logo.png";

const INSTAGRAM_URL = "https://www.instagram.com/alpha.store.eleulma?igsh=MW9rNmlqZGRleDZ2aA==";
const FACEBOOK_URL = "https://www.facebook.com/share/196VyBTVGN/?mibextid=wwXIfr";
const TIKTOK_URL = "https://www.tiktok.com/@alpha.store.eleulma?_r=1&_t=ZT-97iO0hjOICk";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.5 6.5a5.6 5.6 0 0 1-3.4-1.2 5.6 5.6 0 0 1-2.1-3.8h-3v13.1a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V8.9a5.9 5.9 0 0 0-.8-.1 5.8 5.8 0 1 0 5.8 5.8V9.1a8.6 8.6 0 0 0 5.4 1.9V8a5.4 5.4 0 0 1 0-1.5Z"/>
    </svg>
  );
}

export function SiteFooter() {
  const t = useT();
  const { locale } = useI18n();
  return (
    <footer className="border-t border-hairline mt-8 bg-[#2a0f4a] text-white">
      {/* Massive wordmark */}
      <div className="max-w-[1600px] mx-auto px-6 pt-24 pb-16 border-b border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-12">
          <div>
            <img src={alphaLogo} alt="Alpha Store" className="h-16 w-auto mb-6" />
            <div className="flex items-center gap-3 mt-6">
              {[
                { i: Instagram, l: "Instagram", href: INSTAGRAM_URL },
                { i: Facebook, l: "Facebook", href: FACEBOOK_URL },
                { i: TikTokIcon, l: "TikTok", href: TIKTOK_URL },
              ].map(({ i: Icon, l, href }) => (
                <a
                  key={l}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={l}
                  className="size-10 rounded-full border border-white/20 grid place-items-center text-white/80 hover:text-[#2a0f4a] hover:bg-white hover:border-white transition-all"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="eyebrow mb-5 text-white">{locale === "fr" ? "Catalogue" : "الكتالوج"}</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/category/$slug" params={{ slug: "playstation" }} className="hover:text-white transition-colors">PlayStation</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "xbox" }} className="hover:text-white transition-colors">Xbox</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "nintendo" }} className="hover:text-white transition-colors">Nintendo</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "vr" }} className="hover:text-white transition-colors">Réalité Virtuelle</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "jeux" }} className="hover:text-white transition-colors">Jeux vidéo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="eyebrow mb-5 text-white">{locale === "fr" ? "Le magasin" : "المتجر"}</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>{t.delivery}</li>
              <li>{t.warranty}</li>
              <li>{t.payment}</li>
              <li>{locale === "fr" ? "SAV & retours" : "خدمة ما بعد البيع"}</li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  {t.admin} →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 py-12 flex flex-col items-center justify-center gap-6">
          <img src={alphaLogo} alt="Alpha Store" className="h-32 md:h-40 w-auto opacity-95" />
          <p className="text-[10px] text-white/60 uppercase tracking-widest">© {new Date().getFullYear()} Alpha Store. {locale === "fr" ? "Tous droits réservés." : "جميع الحقوق محفوظة."}</p>
        </div>
      </div>
    </footer>
  );
}