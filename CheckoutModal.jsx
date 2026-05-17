import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";
import { whatsappEnquiryLink } from "../utils/order";

export default function Footer() {
  const { lang, t } = useLang();

  return (
    <footer className="bg-navy-deep text-cream">
      <div className="kanga-stripe h-2" />

      <div className="mx-auto max-w-5xl px-4 pt-10 pb-6">
        <div className="grid gap-8 sm:grid-cols-3">

          {/* Brand column */}
          <div>
            <img
              src="/logo.png"
              alt="Jiko La Bibi JJJ"
              width={64} height={64}
              className="mb-3 rounded-full border-2 border-gold object-cover"
            />
            <h3 className="font-display text-xl font-black text-gold">
              {business.shortName}
            </h3>
            <p className="mt-1 text-sm italic text-cream/65">
              {lang === "sw" ? business.tagline_sw : business.tagline_en}
            </p>
            <p className="mt-3 text-xs text-cream/50">
              {lang === "sw"
                ? "Vyakula vya nyumbani · Bei nafuu · Huduma bora"
                : "Home cooking · Fair prices · Great service"}
            </p>
          </div>

          {/* Contact column */}
          <div>
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[3px] text-gold/70">
              {t("callUs")}
            </h4>
            <a
              href={`tel:${business.phoneDisplay}`}
              className="mb-2 flex items-center gap-2 text-sm hover:text-gold transition-colors"
            >
              <i className="ti ti-phone text-gold" aria-hidden="true" />
              {business.phoneDisplay}
            </a>
            <a
              href={whatsappEnquiryLink(lang)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm hover:text-gold transition-colors"
            >
              <i className="ti ti-brand-whatsapp text-[#25d366]" aria-hidden="true" />
              WhatsApp Business
            </a>

            {/* Lipa Namba — hero display */}
            <div className="mt-5 rounded-xl border border-gold/30 bg-navy px-4 py-3 text-center">
              <p className="text-[9px] font-bold uppercase tracking-[2px] text-gold/60">
                {t("payInfo")} — Lipa Namba
              </p>
              <p className="mt-1 font-display text-2xl font-black tracking-widest text-gold">
                {business.lipaNamba}
              </p>
              <p className="text-[9px] text-cream/50 mt-0.5">{business.lipaName}</p>
            </div>
          </div>

          {/* Location column */}
          <div>
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[3px] text-gold/70">
              {t("location")}
            </h4>
            <p className="flex items-start gap-2 text-sm text-cream/80">
              <i className="ti ti-map-pin mt-0.5 shrink-0 text-gold" aria-hidden="true" />
              {business.area}, {business.city}
            </p>
            {business.mapsLink && (
              <a
                href={business.mapsLink}
                target="_blank"
                rel="noreferrer"
                className="mt-1 ml-6 block text-xs text-gold hover:underline"
              >
                {lang === "sw" ? "Tazama Ramani →" : "View on Map →"}
              </a>
            )}

            <div className="mt-4">
              <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-[3px] text-gold/70">
                {t("openHours")}
              </h4>
              <p className="flex items-center gap-2 text-sm text-cream/80">
                <i className="ti ti-clock shrink-0 text-gold" aria-hidden="true" />
                {lang === "sw" ? business.hours_sw : business.hours_en}
              </p>
            </div>

            {/* WiFi + Entertainment badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-[10px] text-cream/70">
                <i className="ti ti-wifi text-gold text-[12px]" aria-hidden="true" />
                WiFi Bure
              </span>
              <span className="flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-[10px] text-cream/70">
                <i className="ti ti-device-tv text-gold text-[12px]" aria-hidden="true" />
                Entertainment
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-cream/10 pt-5 text-xs text-cream/35">
          <span>© {new Date().getFullYear()} {business.name} · {business.city}, Tanzania</span>
          <span className="italic">Ladha ya Tanzania Katika Kila Kijiko 🇹🇿</span>
        </div>
      </div>
    </footer>
  );
}
