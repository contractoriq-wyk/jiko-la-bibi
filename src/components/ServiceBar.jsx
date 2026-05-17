import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";

export default function ServiceBar() {
  const { lang } = useLang();

  const all = [
    { key: "pickup", sw: "Kuchukua", en: "Pickup", icon: "🥡" },
    { key: "delivery", sw: "Kuletewa", en: "Delivery", icon: "🛵" },
    { key: "dinein", sw: "Kula Hapa", en: "Dine In", icon: "🍽️" },
    { key: "events", sw: "Sherehe", en: "Events", icon: "🎉" },
  ].filter((s) => business.services[s.key]);

  return (
    <div className="bg-navy">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px sm:grid-cols-4">
        {all.map((s) => (
          <div
            key={s.key}
            className="flex items-center justify-center gap-2 px-3 py-3 text-center"
          >
            <span className="text-xl">{s.icon}</span>
            <span className="text-sm font-semibold text-cream/90">
              {lang === "sw" ? s.sw : s.en}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
