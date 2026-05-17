import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";
import { whatsappEnquiryLink } from "../utils/order";

const FOOD_STRIP = [
  { emoji: "☕", bg: "#6B3A1F" }, { emoji: "🍛", bg: "#1A5C2E" },
  { emoji: "🍗", bg: "#8B1A1A" }, { emoji: "🫕", bg: "#8B4C0A" },
  { emoji: "🍟", bg: "#2C3E50" }, { emoji: "🍲", bg: "#4A235A" },
  { emoji: "🧃", bg: "#1A4D6E" }, { emoji: "🍌", bg: "#2D5A27" },
  { emoji: "🫓", bg: "#5A3010" }, { emoji: "🍩", bg: "#7B2D00" },
];

export default function Hero() {
  const { lang, t } = useLang();

  function handleWA() {
    const phone = business.whatsapp;
    const text = encodeURIComponent(
      lang === "sw"
        ? "Habari Jiko La Bibi JJJ, ningependa kuagiza..."
        : "Hello Jiko La Bibi JJJ, I would like to place an order..."
    );
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) {
      // Try WhatsApp Business first on Android
      window.location.href = `intent://send?phone=${phone}&text=${text}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end`;
    } else {
      window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    }
  }

  return (
    <section id="top" className="relative overflow-hidden bg-navy-deep text-cream">
      {/* Atmospheric glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-navy-soft/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gold/5 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pt-10 pb-6 text-center">

        {/* Top badge */}
        <div className="fade-up fade-up-1 mb-5 inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          <span className="text-[10px] font-bold tracking-[3px] text-gold uppercase">
            Kwa Ladha Halisi ya Nyumbani
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        </div>

        {/* Real Logo */}
        <div className="fade-up fade-up-2 mx-auto mb-6 w-fit">
          <div className="relative">
            {/* Decorative rings */}
            <div className="absolute inset-0 -m-2 rounded-full border-2 border-gold/30" />
            <div className="absolute inset-0 -m-4 rounded-full border border-gold/15" />
            <img
              src="/logo.png"
              alt="Unyamwezini Jiko La Bibi JJJ — family logo"
              width={164} height={164}
              className="relative rounded-full border-4 border-gold object-cover shadow-gold"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="fade-up fade-up-2 font-display text-4xl font-black leading-[1.08] sm:text-6xl">
          Unyamwezini
          <br />
          <span className="text-gold">Jiko La Bibi JJJ</span>
        </h1>

        <p className="fade-up fade-up-3 mt-3 font-display text-lg italic text-cream/75 sm:text-2xl">
          {lang === "sw" ? business.tagline_sw : business.tagline_en}
        </p>

        {/* FRESHI · LADHA · SAFI strip */}
        <div className="fade-up fade-up-3 mx-auto mt-5 inline-flex items-center gap-3 rounded bg-gold px-6 py-2.5">
          {["FRESHI", "•", "LADHA", "•", "SAFI"].map((w, i) => (
            <span
              key={i}
              className={`text-navy-deep font-bold ${w === "•" ? "text-navy/50 text-sm" : "text-[11px] tracking-[2px]"}`}
            >
              {w}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="fade-up fade-up-4 mt-7 flex flex-wrap justify-center gap-3">
          <a
            href="#menu"
            className="rounded-full bg-gold px-8 py-3 font-bold text-navy shadow-gold transition hover:bg-gold-light active:scale-95"
          >
            {t("viewMenu")} →
          </a>
          <button
            onClick={handleWA}
            className="flex items-center gap-2 rounded-full border-2 border-[#25d366] bg-[#25d366]/10 px-6 py-3 font-bold text-[#4aec80] transition hover:bg-[#25d366] hover:text-navy active:scale-95"
          >
            <i className="ti ti-brand-whatsapp text-lg" aria-hidden="true" />
            WhatsApp Business
          </button>
        </div>

        {/* Food emoji strip */}
        <div className="fade-up fade-up-4 mt-8 flex flex-wrap justify-center gap-2">
          {FOOD_STRIP.map((f, i) => (
            <div
              key={i}
              className="food-ball grid h-[52px] w-[52px] place-items-center rounded-full border-2 border-gold/25 text-[22px] transition-transform"
              style={{ background: f.bg }}
            >
              {f.emoji}
            </div>
          ))}
        </div>
      </div>

      <div className="kanga-stripe h-2 mt-4" />
    </section>
  );
}
