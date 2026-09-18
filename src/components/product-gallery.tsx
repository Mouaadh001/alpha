import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

type Props = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: Props) {
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const list = images.length > 0 ? images : [];

  const go = (i: number) => {
    if (list.length === 0) return;
    setIndex(((i % list.length) + list.length) % list.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    touchStartX.current = null;
  };

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomOpen(false);
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen, index]);

  if (list.length === 0) {
    return (
      <div className="aspect-square bg-muted grid place-items-center">
        <span className="eyebrow">Alpha</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className="relative aspect-square md:aspect-[4/5] w-full overflow-hidden bg-[color-mix(in_oklab,var(--color-surface)_92%,white_2%)] cursor-zoom-in group"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => setZoomOpen(true)}
      >
        {list.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={alt}
            draggable={false}
            className={`absolute inset-0 w-full h-full object-contain p-2 md:p-12 transition-opacity duration-500 select-none ${i === index ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          />
        ))}

        <div className="absolute top-4 end-4 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80 backdrop-blur px-2 py-1 border border-hairline">
          <ZoomIn className="size-3" /> Tap to zoom
        </div>

        {list.length > 1 && (
          <>
            <button
              aria-label="Previous"
              onClick={(e) => { e.stopPropagation(); go(index - 1); }}
              className="hidden md:grid place-items-center absolute start-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-background/60 backdrop-blur border border-hairline opacity-0 group-hover:opacity-100 transition"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              aria-label="Next"
              onClick={(e) => { e.stopPropagation(); go(index + 1); }}
              className="hidden md:grid place-items-center absolute end-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-background/60 backdrop-blur border border-hairline opacity-0 group-hover:opacity-100 transition"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {list.map((_, i) => (
                <span key={i} className={`h-0.5 transition-all ${i === index ? "w-6 bg-lime" : "w-3 bg-border"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-4 grid grid-cols-5 md:grid-cols-6 gap-2">
          {list.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setIndex(i)}
              aria-label={`Image ${i + 1}`}
              className={`aspect-square overflow-hidden bg-surface border transition ${i === index ? "border-lime" : "border-hairline hover:border-muted-foreground"}`}
            >
              <img src={src} alt="" className="w-full h-full object-contain p-2" />
            </button>
          ))}
        </div>
      )}

      {zoomOpen && (
        <div
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center "
          onClick={() => setZoomOpen(false)}
        >
          <button
            aria-label="Close"
            onClick={() => setZoomOpen(false)}
            className="absolute top-6 end-6 size-11 grid place-items-center rounded-full border border-hairline bg-surface/80 hover:text-lime"
          >
            <X className="size-5" />
          </button>
          <ZoomableImage src={list[index]} alt={alt} />
          {list.length > 1 && (
            <>
              <button
                aria-label="Previous"
                onClick={(e) => { e.stopPropagation(); go(index - 1); }}
                className="absolute start-6 top-1/2 -translate-y-1/2 size-12 grid place-items-center rounded-full border border-hairline bg-surface/80 hover:text-lime"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                aria-label="Next"
                onClick={(e) => { e.stopPropagation(); go(index + 1); }}
                className="absolute end-6 top-1/2 -translate-y-1/2 size-12 grid place-items-center rounded-full border border-hairline bg-surface/80 hover:text-lime"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {index + 1} / {list.length} — Click / pinch to zoom
          </div>
        </div>
      )}
    </div>
  );
}

function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef<{ x: number; y: number } | null>(null);
  const pinch = useRef<{ dist: number; scale: number } | null>(null);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const next = Math.min(4, Math.max(1, scale + (e.deltaY < 0 ? 0.2 : -0.2)));
    setScale(next);
    if (next === 1) setPos({ x: 0, y: 0 });
  };

  const onDblClick = () => {
    if (scale === 1) setScale(2);
    else { setScale(1); setPos({ x: 0, y: 0 }); }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale === 1) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragging.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setPos({ x: e.clientX - dragging.current.x, y: e.clientY - dragging.current.y });
  };
  const onPointerUp = () => { dragging.current = null; };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinch.current = { dist: Math.hypot(dx, dy), scale };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinch.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const next = Math.min(4, Math.max(1, pinch.current.scale * (dist / pinch.current.dist)));
      setScale(next);
      if (next === 1) setPos({ x: 0, y: 0 });
    }
  };
  const onTouchEnd = () => { pinch.current = null; };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden touch-none" onClick={(e) => e.stopPropagation()}>
      <img
        src={src}
        alt={alt}
        draggable={false}
        onWheel={onWheel}
        onDoubleClick={onDblClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
          transition: dragging.current || pinch.current ? "none" : "transform 0.25s ease",
          cursor: scale === 1 ? "zoom-in" : "grab",
        }}
        className="max-w-[90vw] max-h-[85vh] object-contain select-none"
      />
    </div>
  );
}