import { useLang } from "../lang/LanguageContext";
import { useCart } from "../cart/CartContext";
import { formatMoney } from "../utils/order";
import { itemFromPrice, sectionMeta } from "../data/menu";
import { PlusIcon } from "./Icons";

export default function MenuItemCard({ item, onConfigure }) {
  const { lang, t } = useLang();
  const { addLine } = useCart();
  const meta = sectionMeta(item.section);

  const needsConfig = Boolean(item.sizes || item.choices);
  const from = itemFromPrice(item);

  function handleAdd() {
    if (needsConfig) {
      onConfigure(item);
    } else {
      addLine({ itemId: item.id, name: item.name, unitPrice: item.price, qty: 1 });
    }
  }

  return (
    <div className="menu-card flex items-center gap-3 rounded-xl border border-navy/10 bg-white pl-0 pr-3 py-0 overflow-hidden">
      {/* Emoji avatar */}
      <div
        className="flex h-[70px] w-[70px] shrink-0 items-center justify-center text-[28px] self-stretch"
        style={{ background: meta.color }}
      >
        {item.emoji}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 py-3">
        <h3 className="font-display text-[14px] font-bold leading-snug text-navy line-clamp-2">
          {item.name[lang]}
        </h3>
        <p className="mt-0.5 text-[11px] italic text-navy/45 line-clamp-1">
          {item.name[lang === "sw" ? "en" : "sw"]}
        </p>
        <p className="mt-1.5 text-sm font-bold text-gold-deep">
          {item.sizes && (
            <span className="mr-1 text-[10px] font-medium text-navy/45">
              {t("from")}
            </span>
          )}
          {formatMoney(from)}
        </p>
      </div>

      {/* Add button */}
      <button
        onClick={handleAdd}
        aria-label={`${t("addToCart")} ${item.name[lang]}`}
        className="shrink-0 grid h-9 w-9 place-items-center rounded-full bg-navy text-gold transition hover:bg-navy-light active:scale-90"
      >
        <PlusIcon />
      </button>
    </div>
  );
}
