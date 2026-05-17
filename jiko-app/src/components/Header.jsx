import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";
import { useCart } from "../cart/CartContext";
import { CartIcon } from "./Icons";

export default function Header({ onCartClick }) {
  const { lang, toggle } = useLang();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40">
      <div className="kanga-stripe h-1.5" />
      <div className="bg-navy-deep/97 backdrop-blur supports-[backdrop-filter]:bg-navy-deep/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">

          {/* Brand */}
          <a href="#top" className="flex items-center gap-3 min-w-0 group">
            <img
              src="/logo-sm.webp"
              alt="Jiko La Bibi JJJ logo"
              width={40} height={40}
              className="shrink-0 rounded-full border-2 border-gold object-cover group-hover:border-gold-light transition-colors"
            />
            <span className="min-w-0">
              <span className="block truncate font-display text-[15px] font-bold leading-tight text-cream">
                {business.shortName}
              </span>
              <span className="block truncate text-[10px] tracking-wide text-gold/80 italic">
                {business.tagline_en}
              </span>
            </span>
          </a>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="rounded-full border border-gold/50 px-3 py-1.5 text-xs font-bold text-gold transition hover:bg-gold hover:text-navy"
              aria-label="Switch language"
            >
              {lang === "sw" ? "EN" : "SW"}
            </button>
            <button
              onClick={onCartClick}
              className="relative grid h-10 w-10 place-items-center rounded-full bg-gold text-navy transition hover:bg-gold-light active:scale-95"
              aria-label="Open order"
            >
              <CartIcon />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-navy px-1 text-[11px] font-bold text-gold ring-2 ring-navy-deep">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
