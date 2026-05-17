import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";
import { PhoneIcon, PinIcon, ClockIcon, WhatsAppIcon } from "./Icons";
import { whatsappEnquiryLink } from "../utils/order";

export default function Footer() {
  const { lang, t } = useLang();

  return (
    <footer className="bg-navy-deep text-cream">
      <div className="kanga-border h-2" />

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-black text-gold">
              {business.shortName}
            </h3>
            <p className="mt-1 italic text-cream/70">
              {lang === "sw" ? business.tagline_sw : business.tagline_en}
            </p>
            <p className="mt-3 text-sm text-cream/60">
              {lang === "sw"
                ? "Vyakula vya nyumbani · Bei nafuu · Huduma bora"
                : "Home cooking · Fair prices · Great service"}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gold/70">
              {t("callUs")}
            </h4>
            <a
              href={`tel:${business.phoneDisplay}`}
              className="mb-2 flex items-center gap-2 text-sm hover:text-gold"
            >
              <PhoneIcon className="shrink-0" />
              {business.phoneDisplay}
            </a>
            <a
              href={whatsappEnquiryLink(lang)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm hover:text-gold"
            >
              <WhatsAppIcon className="shrink-0" width={20} height={20} />
              WhatsApp
            </a>

            <div className="mt-4">
              <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-gold/70">
                {t("payInfo")}
              </h4>
              <p className="text-sm">
                Lipa Namba:{" "}
                <span className="font-bold text-gold">
                  {business.lipaNamba}
                </span>
              </p>
              <p className="text-xs text-cream/60">{business.lipaName}</p>
            </div>
          </div>

          {/* Location & hours */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gold/70">
              {t("location")}
            </h4>
            <p className="flex items-start gap-2 text-sm text-cream/80">
              <PinIcon className="mt-0.5 shrink-0" />
              {business.area}, {business.city}
            </p>
            {business.mapsLink && (
              <a
                href={business.mapsLink}
                target="_blank"
                rel="noreferrer"
                className="mt-1 ml-7 block text-xs text-gold hover:underline"
              >
                {lang === "sw" ? "Tazama Ramani →" : "View on Map →"}
              </a>
            )}
            <div className="mt-4">
              <h4 className="mb-1 text-xs font-bold uppercase tracking-widest text-gold/70">
                {t("openHours")}
              </h4>
              <p className="flex items-center gap-2 text-sm text-cream/80">
                <ClockIcon className="shrink-0" />
                {lang === "sw" ? business.hours_sw : business.hours_en}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-cream/10 pt-6 text-center text-xs text-cream/40">
          © {new Date().getFullYear()} {business.name} · {business.city}, Tanzania
        </div>
      </div>
    </footer>
  );
}
