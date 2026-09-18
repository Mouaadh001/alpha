import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { productsByCategoryPreviewQO, type Category } from "@/lib/queries";
import { ProductCard } from "./product-card";
import { useI18n } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

export function CategoryProductStrip({ category, index }: { category: Category; index: number }) {
  const { data: products = [] } = useQuery(productsByCategoryPreviewQO(category.id));
  const { locale } = useI18n();
  const name = locale === "ar" && category.name_ar ? category.name_ar : category.name_fr;
  void index;
  const items = products.slice(0, 10);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedUntilRef = useRef(0);
  const posRef = useRef(0);
  const draggingRef = useRef(false);
  const settleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let autoActive = false;
    const enterAuto = () => {
      if (autoActive) return;
      autoActive = true;
      posRef.current = el.scrollLeft;
      el.style.scrollSnapType = "none";
      el.scrollLeft = 0;
    };
    const exitAuto = () => {
      if (!autoActive) return;
      autoActive = false;
      const offset = posRef.current;
      track.style.transform = "translate3d(0,0,0)";
      el.scrollLeft = offset;
      el.style.scrollSnapType = "x mandatory";
    };

    const pause = (ms = 2500) => {
      pausedUntilRef.current = performance.now() + ms;
      exitAuto();
    };

    const pauseWhileDragging = () => {
      draggingRef.current = true;
      pausedUntilRef.current = Number.POSITIVE_INFINITY;
      exitAuto();
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    };

    const scheduleResume = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      pausedUntilRef.current = Number.POSITIVE_INFINITY;
      const arm = () => {
        if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = window.setTimeout(() => {
          settleTimerRef.current = null;
          el.removeEventListener("scroll", onSettleScroll);
          pausedUntilRef.current = performance.now();
          last = performance.now();
        }, 30);
      };
      const onSettleScroll = () => arm();
      el.addEventListener("scroll", onSettleScroll, { passive: true });
      arm();
    };

    const onWheel = () => pause(700);

    el.addEventListener("pointerdown", pauseWhileDragging, { passive: true });
    el.addEventListener("touchstart", pauseWhileDragging, { passive: true });
    window.addEventListener("pointerup", scheduleResume, { passive: true });
    window.addEventListener("touchend", scheduleResume, { passive: true });
    window.addEventListener("pointercancel", scheduleResume, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });

    let raf = 0;
    let last = performance.now();
    const SPEED = 55; // px/sec
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (now >= pausedUntilRef.current) {
        const loopPoint = track.scrollWidth / 2;
        if (loopPoint > 0) {
          enterAuto();
          posRef.current += SPEED * dt;
          if (posRef.current >= loopPoint) posRef.current -= loopPoint;
          track.style.transform = `translateX(${-posRef.current.toFixed(2)}px)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      exitAuto();
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
      el.removeEventListener("pointerdown", pauseWhileDragging);
      el.removeEventListener("touchstart", pauseWhileDragging);
      window.removeEventListener("pointerup", scheduleResume);
      window.removeEventListener("touchend", scheduleResume);
      window.removeEventListener("pointercancel", scheduleResume);
      el.removeEventListener("wheel", onWheel);
    };
  }, [products.length]);

  if (products.length === 0) return null;

  const renderSequence = (suffix: string) => (
    <>
      {items.map((p) => (
        <div
          key={`${p.id}-${suffix}`}
          className="shrink-0 w-[44vw] sm:w-[32vw] md:w-[24vw] lg:w-[18vw] max-w-[280px]"
          style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}
        >
          <ProductCard product={p} />
        </div>
      ))}
      <Link
        key={`more-${suffix}`}
        to="/category/$slug"
        params={{ slug: category.slug }}
        className="shrink-0 w-[42vw] sm:w-[26vw] md:w-[18vw] lg:w-[14vw] max-w-[220px] rounded-2xl border border-lime/30 bg-lime/5 flex flex-col items-center justify-center gap-2 text-lime font-semibold text-sm hover:bg-lime/10 transition-colors"
        style={{ scrollSnapAlign: "start" }}
      >
        <ArrowRight className="size-6" />
        {locale === "fr" ? "Voir plus" : "المزيد"}
      </Link>
    </>
  );

  return (
    <section className="pt-8 md:pt-12">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        <div
          className="rounded-3xl border border-white/10 p-4 md:p-6 shadow-[0_10px_40px_-20px_rgba(168,85,247,0.35)]"
          style={{
            background:
              "linear-gradient(180deg, rgba(168,85,247,0.10) 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.02) 100%)",
          }}
        >
          <div className="mb-5 flex items-end justify-between gap-6">
            <h2 className="font-display font-extrabold text-2xl md:text-4xl tracking-tight">{name}</h2>
            <Link
              to="/category/$slug"
              params={{ slug: category.slug }}
              className="group inline-flex items-center gap-1 text-sm font-semibold text-lime hover:opacity-80"
            >
              {locale === "fr" ? "Tout voir" : "عرض الكل"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div
            ref={scrollerRef}
            data-testid="category-product-strip-scroller"
            className="-mx-4 md:-mx-6 overflow-x-auto overflow-y-hidden no-scrollbar"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              overscrollBehaviorX: "contain",
              scrollPaddingLeft: "1rem",
              scrollPaddingRight: "1rem",
              scrollbarWidth: "none",
            }}
          >
            <div
              ref={trackRef}
              className="flex gap-3 md:gap-4 px-4 md:px-6 pb-2 w-max"
              style={{
                transform: "translateX(0)",
                willChange: "transform",
              }}
            >
              {renderSequence("a")}
              {renderSequence("b")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}