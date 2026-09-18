export function formatDA(cents: number, locale: "fr" | "ar" = "fr"): string {
  const value = Math.round(cents);
  const grouped = value.toLocaleString(locale === "ar" ? "ar-DZ" : "fr-DZ").replace(/,/g, " ");
  return locale === "ar" ? `${grouped} د.ج` : `${grouped} DA`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}