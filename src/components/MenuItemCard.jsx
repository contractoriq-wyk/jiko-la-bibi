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
      style={{
        display: "flex",
        alignItems: "stretch",
        background: "#FFFFFF",
        borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 3px 14px rgba(0,0,0,0.08)",
      }}
    >
      {/* Vivid left colour strip — section identity */}
      <div style={{ width: "5px", background: meta.color, flexShrink: 0 }} />

      {/* Emoji avatar — clean light tint, big emoji */}
      <div
        style={{
          width: "72px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "36px",
          background: meta.color + "18",
          userSelect: "none",
        }}
      >
        {item.emoji}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0, padding: "11px 10px" }}>
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "13.5px",
            fontWeight: "700",
            color: "#0B1F45",
            lineHeight: 1.3,
          }}
        >
          {item.name[lang]}
        </div>
        <div
          style={{
            fontSize: "11px",
            fontStyle: "italic",
            color: "rgba(11,31,69,0.38)",
            marginTop: "2px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {item.name[lang === "sw" ? "en" : "sw"]}
        </div>
        <div
          style={{
            fontSize: "13px",
            fontWeight: "700",
            color: "#9A7800",
            marginTop: "6px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {item.sizes && (
            <span style={{ fontSize: "10px", fontWeight: "400", color: "rgba(11,31,69,0.38)" }}>
              {t("from")}
            </span>
          )}
          {formatMoney(from)}
        </div>
      </div>

      {/* Add button — matches section colour */}
      <div style={{ display: "flex", alignItems: "center", paddingRight: "12px", flexShrink: 0 }}>
        <button
          onClick={handleAdd}
          aria-label={`Add ${item.name[lang]}`}
          style={{
            background: meta.color,
            color: "#FFFFFF",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}
