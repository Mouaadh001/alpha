import floatPs5 from "@/assets/float-ps5-console.webp";
import floatXbox from "@/assets/float-xbox-console.webp";
import floatSwitch from "@/assets/float-switch.webp";
import floatManette from "@/assets/float-manette.webp";
import floatHeadset from "@/assets/float-headset.webp";

/**
 * Animated deep-space backdrop with blurred gaming props drifting slowly.
 * Positioned as `absolute inset-0` inside a `relative` parent.
 */
export function SpaceBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-0">
      {/* Deep space gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 20% 10%, rgba(120,60,200,0.35), transparent 60%), radial-gradient(70% 55% at 85% 90%, rgba(30,120,200,0.30), transparent 60%), radial-gradient(50% 50% at 60% 40%, rgba(198,255,61,0.10), transparent 70%), linear-gradient(180deg, #05030d 0%, #0a0616 50%, #05030d 100%)",
        }}
      />
      {/* Star field via layered radial-gradients */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: [
            "radial-gradient(1px 1px at 12% 22%, #fff 50%, transparent 51%)",
            "radial-gradient(1px 1px at 28% 78%, #fff 50%, transparent 51%)",
            "radial-gradient(1.5px 1.5px at 45% 40%, #d8b8ff 50%, transparent 51%)",
            "radial-gradient(1px 1px at 65% 15%, #fff 50%, transparent 51%)",
            "radial-gradient(1px 1px at 82% 68%, #b8e6ff 50%, transparent 51%)",
            "radial-gradient(1.5px 1.5px at 92% 30%, #fff 50%, transparent 51%)",
            "radial-gradient(1px 1px at 8% 55%, #fff 50%, transparent 51%)",
            "radial-gradient(1px 1px at 55% 88%, #fff 50%, transparent 51%)",
          ].join(","),
        }}
      />
      <div
        className="absolute inset-0 opacity-90 animate-twinkle"
        style={{
          backgroundImage: [
            "radial-gradient(1.2px 1.2px at 35% 20%, #fff 50%, transparent 51%)",
            "radial-gradient(1px 1px at 72% 55%, #c6ff3d 50%, transparent 51%)",
            "radial-gradient(1.5px 1.5px at 20% 82%, #fff 50%, transparent 51%)",
          ].join(","),
        }}
      />

      {/* Drifting blurred props */}
      <img
        src={floatPs5}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute left-[-6%] top-[8%] w-[32%] max-w-[380px] opacity-40 blur-[2px] animate-drift-a"
      />
      <img
        src={floatXbox}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute right-[-4%] top-[55%] w-[30%] max-w-[340px] opacity-40 blur-[2px] animate-drift-b"
      />
      <img
        src={floatSwitch}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute left-[40%] top-[70%] w-[20%] max-w-[220px] opacity-35 blur-[1.5px] animate-drift-c"
      />
      <img
        src={floatManette}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute left-[15%] top-[45%] w-[14%] max-w-[160px] opacity-45 blur-[1.5px] animate-drift-b"
      />
      <img
        src={floatManette}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute right-[20%] top-[12%] w-[12%] max-w-[140px] opacity-40 blur-[1.5px] animate-drift-c"
        style={{ transform: "scaleX(-1)" }}
      />
      <img
        src={floatHeadset}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute right-[8%] top-[25%] w-[16%] max-w-[180px] opacity-40 blur-[1.5px] animate-drift-a"
      />

      {/* Soft top/bottom fade so it blends with adjacent sections */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
