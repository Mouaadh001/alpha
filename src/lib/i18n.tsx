import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "fr" | "ar";

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; dir: "ltr" | "rtl" };

const I18nCtx = createContext<Ctx | null>(null);

function readLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem("alpha:locale");
    return stored === "fr" || stored === "ar" ? stored : null;
  } catch {
    return null;
  }
}

function writeLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("alpha:locale", locale);
  } catch {}
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const stored = readLocale();
    if (stored) setLocaleState(stored);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    writeLocale(l);
  };

  return (
    <I18nCtx.Provider value={{ locale, setLocale, dir: locale === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nCtx);
  if (!ctx) return { locale: "fr", setLocale: () => {}, dir: "ltr" };
  return ctx;
}

export const T = {
  fr: {
    catalog: "Catalogue",
    categories: "Catégories",
    search: "Rechercher",
    cart: "Panier",
    account: "Compte",
    admin: "Espace Admin",
    signIn: "Connexion",
    signOut: "Déconnexion",
    all: "Tout voir",
    featured: "Sélection premium",
    newDrops: "Nouveautés",
    addToCart: "Ajouter au panier",
    outOfStock: "Rupture",
    browseUniverse: "Parcourir par univers",
    home: "Accueil",
    products: "Produits",
    noProducts: "Aucun produit dans cette catégorie pour le moment.",
    subcategories: "Sous-catégories",
    price: "Prix",
    stock: "Stock",
    description: "Description",
    delivery: "Livraison rapide 58 wilayas",
    warranty: "Garantie 2 ans",
    payment: "Paiement à la livraison",
  },
  ar: {
    catalog: "الكتالوج",
    categories: "الفئات",
    search: "بحث",
    cart: "السلة",
    account: "الحساب",
    admin: "لوحة الإدارة",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    all: "عرض الكل",
    featured: "المختارات المميزة",
    newDrops: "الجديد",
    addToCart: "أضف إلى السلة",
    outOfStock: "نفدت الكمية",
    browseUniverse: "تصفح حسب الفئة",
    home: "الرئيسية",
    products: "المنتجات",
    noProducts: "لا توجد منتجات في هذه الفئة حالياً.",
    subcategories: "الفئات الفرعية",
    price: "السعر",
    stock: "المخزون",
    description: "الوصف",
    delivery: "توصيل سريع لـ 58 ولاية",
    warranty: "ضمان سنتين",
    payment: "الدفع عند الاستلام",
  },
} as const;

export function useT() {
  const { locale } = useI18n();
  return T[locale];
}