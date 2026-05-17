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
    <div
      style={{ borderColor: "rgba(11,31,69,0.12)" }}
      className="flex items-center gap-0 rounded-xl border bg-white overflow-hidden transition-all hover:border-yellow-500 hover:shadow-md"
    >
      {/* Coloured emoji avatar */}
      <div
        className="flex h-[72px] w-[72px] shrink-0 items-center justify-center text-[30px] self-stretch"
        style={{ background: meta.color }}
      >
        {item.emoji}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 px-3 py-3">
        <h3 className="font-display text-[14px] font-bold leading-snug text-navy line-clamp-2">
          {item.name[lang]}
        </h3>
        <p className="mt-0.5 text-[11px] italic text-navy/45 line-clamp-1">
          {item.name[lang === "sw" ? "en" : "sw"]}
        </p>
        <p className="mt-1.5 text-sm font-bold" style={{ color: "#B8941F" }}>
          {item.sizes && (
            <span className="mr-1 text-[10px] font-medium text-navy/45">
              {t("from")}
            </span>
          )}
          {formatMoney(from)}
        </p>
      </div>

      {/* Add button */}
      <div className="pr-3">
        <button
          onClick={handleAdd}
          aria-label={`Add ${item.name[lang]}`}
          className="grid h-9 w-9 place-items-center rounded-full text-yellow-400 transition hover:scale-110 active:scale-90"
          style={{ background: "#0B1F45" }}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}
