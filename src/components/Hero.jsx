import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";
import { WhatsAppIcon } from "./Icons";
import { whatsappEnquiryLink } from "../utils/order";

export default function Hero() {
  const { lang, t } = useLang();

  return (
    <section id="top" className="relative overflow-hidden bg-navy-deep text-cream">
      {/* Atmospheric layered glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-navy-soft/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-14 sm:py-20">
        <p className="animate-fade-up font-body text-sm uppercase tracking-[0.35em] text-gold">
          {business.city} · Tanzania
        </p>

        <h1
          className="mt-4 animate-fade-up font-display text-4xl font-black leading-[1.05] sm:text-6xl"
          style={{ animationDelay: "0.08s" }}
        >
          {business.name.split(" ").slice(0, 1).join(" ")}{" "}
          <span className="text-gold">
            {business.name.split(" ").slice(1).join(" ")}
          </span>
        </h1>

        <p
          className="mt-4 max-w-xl animate-fade-up font-display text-lg italic text-cream/85 sm:text-2xl"
          style={{ animationDelay: "0.16s" }}
        >
          {lang === "sw" ? business.tagline_sw : business.tagline_en}
        </p>

        <p
          className="mt-3 max-w-xl animate-fade-up text-sm text-cream/70 sm:text-base"
          style={{ animationDelay: "0.22s" }}
        >
          {lang === "sw"
            ? "Vyakula vya nyumbani vilivyopikwa kwa ladha halisi ya Kitanzania. Bei nafuu, huduma bora."
            : "Authentic Tanzanian home cooking, made with real flavour. Fair prices, great service."}
        </p>

        <div
          className="mt-8 flex animate-fade-up flex-wrap gap-3"
          style={{ animationDelay: "0.3s" }}
        >
          <a
            href="#menu"
            className="rounded-full bg-gold px-7 py-3 font-bold text-navy shadow-gold transition hover:bg-gold-light"
          >
            {t("viewMenu")} →
          </a>
          <a
            href={whatsappEnquiryLink(lang)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-gold/50 px-6 py-3 font-bold text-gold transition hover:bg-gold/10"
          >
            <WhatsAppIcon width={20} height={20} />
            WhatsApp
          </a>
        </div>
      </div>

      <div className="kanga-border h-2" />
    </section>
  );
}
