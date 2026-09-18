import { useQuery } from "@tanstack/react-query";
import { announcementBarQO } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

export function AnnouncementBar() {
  // Avoid SSR/CSR mismatch: only render after client mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { data } = useQuery(announcementBarQO);
  const { locale } = useI18n();
  if (!mounted || !data || !data.enabled) return null;

  const raw =
    (locale === "ar" ? data.text_ar || data.text_fr : data.text_fr || data.text_ar) || "";
  const items = raw.split(/·|\|/).map((s) => s.trim()).filter(Boolean);
  if (items.length === 0) return null;
  const duration = Math.max(10, data.speed_seconds ?? 40);
  // Repeat items enough times inside each track so a short single sentence
  // still produces a track wider than the viewport — otherwise a centered item
  // scrolls once and the marquee visibly snaps back.
  const REPEAT = 20;
  const packed = Array.from({ length: REPEAT }).flatMap(() => items);
  const Track = () => (
    <div className="flex items-center h-full shrink-0">
      {packed.map((it, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-3 px-6 text-[11px] font-mono uppercase tracking-[0.18em]"
          dir="auto"
        >
          {it}
          <span className="opacity-40">◆</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="w-full overflow-hidden relative"
      style={{ backgroundColor: data.bg_color, color: "#a855f7", height: 36 }}
      aria-live="polite"
      dir="ltr"
    >
      <div
        className="flex items-center h-full w-max whitespace-nowrap will-change-transform hover:[animation-play-state:paused]"
        style={{
          animation: `alpha-marquee ${duration}s linear infinite`,
        }}
      >
        <Track />
        <Track />
      </div>
    </div>
  );
}