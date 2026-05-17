import { useLang } from "../lang/LanguageContext";
import { useCart } from "../cart/CartContext";
import { formatMoney } from "../utils/order";
import { itemFromPrice } from "../data/menu";
import { PlusIcon } from "./Icons";

export default function MenuItemCard({ item, onConfigure }) {
  const { lang, t } = useLang();
  const { addLine } = useCart();

  // An item needs the option modal if it has sizes or choices.
  const needsConfig = Boolean(item.sizes || item.choices);
  const from = itemFromPrice(item);

  function handleClick() {
    if (needsConfig) {
      onConfigure(item);
    } else {
      addLine({
        itemId: item.id,
        name: item.name,
        unitPrice: item.price,
        qty: 1,
      });
    }
  }

  return (
    <div className="group flex items-center justify-between gap-3 rounded-xl border border-navy/10 bg-white p-3.5 shadow-card transition hover:border-gold/60">
      <div className="min-w-0">
        <h3 className="font-display text-[15px] font-bold leading-snug text-navy">
          {item.name[lang]}
        </h3>
        <p className="mt-0.5 text-xs italic text-navy/55">
          {item.name[lang === "sw" ? "en" : "sw"]}
        </p>
        <p className="mt-1.5 text-sm font-bold text-gold-deep">
          {item.sizes && (
            <span className="mr-1 text-xs font-medium text-navy/50">
              {t("from")}
            </span>
          )}
          {formatMoney(from)}
        </p>
      </div>

      <button
        onClick={handleClick}
        className="flex shrink-0 items-center gap-1 rounded-full bg-navy px-4 py-2 text-sm font-bold text-gold transition hover:bg-navy-light active:scale-95"
      >
        <PlusIcon />
        {t("addToCart")}
      </button>
    </div>
  );
}
