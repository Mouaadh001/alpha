import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { siteStatusQO } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { AnnouncementBar } from "./announcement-bar";
import { WhatsAppButton } from "./whatsapp-button";

export function SiteShell({ children }: { children: ReactNode }) {
  const { data: status } = useQuery(siteStatusQO);
  const { locale } = useI18n();

  if (status?.maintenance) {
    const msg = locale === "ar" ? status.message_ar : status.message_fr;
    return (
      <div className="min-h-screen grid place-items-center bg-background text-foreground px-6 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-6 size-16 rounded-2xl bg-accent/10 text-accent grid place-items-center">
            <Wrench className="size-8" />
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight mb-3">ALPHA STORE</h1>
          <p className="text-muted-foreground">{msg}</p>
          <Link to="/auth" className="inline-block mt-8 text-xs text-muted-foreground/60 hover:text-foreground">Admin</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}