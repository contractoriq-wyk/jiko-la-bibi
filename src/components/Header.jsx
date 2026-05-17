import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";
import { useCart } from "../cart/CartContext";
import { CartIcon } from "./Icons";

export default function Header({ onCartClick }) {
  const { lang, toggle } = useLang();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40">
      <div className="kanga-border h-1.5" />
      <div className="bg-navy-deep/95 backdrop-blur supports-[backdrop-filter]:bg-navy-deep/85">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          {/* Brand */}
          <a href="#top" className="flex items-center gap-3 min-w-0">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-gold bg-navy text-gold font-display text-lg font-black">
              JJJ
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-bold leading-tight text-cream">
                {business.shortName}
              </span>
              <span className="block truncate text-[11px] tracking-wide text-gold/80">
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
              className="relative grid h-10 w-10 place-items-center rounded-full bg-gold text-navy transition hover:bg-gold-light"
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
