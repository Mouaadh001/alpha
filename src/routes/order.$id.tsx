import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Home, MessageCircle } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { useI18n } from "@/lib/i18n";

const WHATSAPP_URL = "https://wa.me/213552870772";

export const Route = createFileRoute("/order/$id")({
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { id } = Route.useParams();
  const { locale } = useI18n();

  return (
    <SiteShell>
      <main className="min-h-[70vh] grid place-items-center px-4 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#22c55e]/15 text-[#22c55e]">
            <CheckCircle2 className="size-9" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-black tracking-tight">
            {locale === "fr" ? "Commande envoyée" : "تم إرسال الطلب"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {locale === "fr"
              ? "Votre commande a été enregistrée. L'équipe Alpha Store vous contactera pour confirmer les détails."
              : "تم تسجيل طلبك. سيتصل بك فريق Alpha Store لتأكيد التفاصيل."}
          </p>
          <p className="mt-4 rounded-2xl bg-white/[0.04] px-4 py-3 font-mono text-[11px] text-muted-foreground break-all">
            {id}
          </p>
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/"
              className="h-12 rounded-full border border-white/10 flex items-center justify-center gap-2 text-sm font-bold hover:bg-white/[0.04]"
            >
              <Home className="size-4" />
              {locale === "fr" ? "Accueil" : "الرئيسية"}
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 rounded-full bg-[#22c55e] text-white flex items-center justify-center gap-2 text-sm font-bold hover:bg-[#16a34a]"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
