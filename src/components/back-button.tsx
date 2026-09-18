import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { locale } = useI18n();
  const label = locale === "ar" ? "رجوع" : "Retour";
  const onClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground transition-colors ${className}`}
    >
      <ArrowLeft className="size-4" />
      {label}
    </button>
  );
}