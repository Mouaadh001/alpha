import { useState } from "react";
import { X } from "lucide-react";

const PHONE = "213552870772";
const MESSAGE = "مرحبا، أريد الاستفسار عن منتج في Alpha Store";
const waHref = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

export function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 end-4 z-[80] flex flex-col items-end gap-2">
      {open && (
        <div
          dir="rtl"
          className="w-[290px] rounded-2xl overflow-hidden shadow-2xl bg-background text-foreground border border-hairline "
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[#25D366] text-white">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <WhatsAppGlyph className="size-6" />
              WhatsApp
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="size-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <div className="p-4 space-y-3 bg-muted/40">
            <div className="relative bg-background rounded-lg rounded-tr-none p-3 text-sm leading-relaxed shadow-sm border border-hairline">
              <p>👋 مرحباً بك في Alpha Store</p>
              <p className="mt-2">هل يمكننا مساعدتك؟</p>
              <p className="mt-2 text-muted-foreground text-xs">الرجاء إرسال رسالة فقط</p>
            </div>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:bg-[#20bd5a] transition"
            >
              <WhatsAppGlyph className="size-5" />
              فتح الدردشة
            </a>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="WhatsApp"
        className="size-14 rounded-full shadow-xl hover:scale-105 active:scale-95 transition overflow-hidden"
      >
        <WhatsAppGlyph className="size-14" />
      </button>
    </div>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} aria-hidden="true">
      <circle cx="128" cy="128" r="128" fill="#25D366" />
      <path
        fill="#FFFFFF"
        d="M128.5 54c-40.8 0-73.9 33.1-73.9 73.9 0 13 3.4 25.7 9.9 36.9L54 202l38.2-10c10.8 5.9 22.9 9 35.3 9h.1c40.8 0 74-33.1 74-73.9 0-19.8-7.7-38.4-21.6-52.4-14-14-32.6-21.7-52.4-21.7zm0 135c-11 0-21.8-3-31.3-8.6l-2.2-1.3-22.7 5.9 6-22.1-1.5-2.3c-6.2-9.9-9.5-21.3-9.5-33 0-33.9 27.6-61.5 61.5-61.5 16.4 0 31.9 6.4 43.5 18 11.6 11.6 18 27.1 18 43.5 0 33.9-27.7 61.4-61.8 61.4zm33.7-46c-1.9-.9-11-5.4-12.7-6-1.7-.6-2.9-.9-4.2.9-1.2 1.9-4.8 6-5.9 7.3-1.1 1.2-2.2 1.4-4 .5-1.9-.9-8-2.9-15.1-9.3-5.6-5-9.4-11.1-10.5-13-1.1-1.9-.1-2.9.8-3.9.8-.8 1.9-2.2 2.9-3.3.9-1.1 1.2-1.9 1.9-3.1.6-1.2.3-2.3-.2-3.3-.5-.9-4.2-10.1-5.7-13.8-1.5-3.6-3-3.1-4.2-3.2-1.1-.1-2.3-.1-3.5-.1-1.2 0-3.3.5-5 2.3-1.7 1.9-6.5 6.4-6.5 15.6 0 9.2 6.7 18.1 7.6 19.3.9 1.2 13.2 20.2 32.1 28.4 4.5 1.9 8 3.1 10.7 4 4.5 1.4 8.6 1.2 11.9.7 3.6-.5 11-4.5 12.6-8.9 1.6-4.3 1.6-8 1.1-8.8-.5-.8-1.7-1.2-3.6-2.1z"
      />
    </svg>
  );
}