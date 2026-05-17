import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";

const SERVICES = [
  { key: "pickup",   emoji: "🥡", sw: "Kuchukua",  en: "Pickup"   },
  { key: "delivery", emoji: "🛵", sw: "Kuletewa",  en: "Delivery" },
  { key: "dinein",   emoji: "🍽️", sw: "Kula Hapa", en: "Dine In"  },
  { key: "events",   emoji: "🎉", sw: "Sherehe",   en: "Events"   },
];

export default function ServiceBar() {
  const { lang } = useLang();
  const active = SERVICES.filter((s) => business.services[s.key]);

  return (
    <div className="bg-navy">
      <div className="mx-auto flex max-w-5xl divide-x divide-gold/20">
        {active.map((s) => (
          <div
            key={s.key}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 px-2 text-center"
          >
            <span className="text-2xl leading-none">{s.emoji}</span>
            <span className="text-[11px] font-semibold tracking-wide text-cream/90">
              {lang === "sw" ? s.sw : s.en}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
