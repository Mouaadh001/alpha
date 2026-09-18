import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
  y?: number;
};

/**
 * Fade-up + subtle scale reveal on scroll. GPU-accelerated, runs once.
 * Respects prefers-reduced-motion.
 */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div", y = 20 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -20px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style: CSSProperties = {
    transition:
      "opacity 220ms ease-out, transform 220ms ease-out",
    transitionDelay: shown ? `${delay}ms` : "0ms",
    willChange: "opacity, transform",
    opacity: shown ? 1 : 0,
    transform: shown ? "translate3d(0,0,0)" : `translate3d(0,${y}px,0)`,
  };
  const Comp = Tag as any;
  return (
    <Comp ref={ref as any} style={style} className={className}>
      {children}
    </Comp>
  );
}