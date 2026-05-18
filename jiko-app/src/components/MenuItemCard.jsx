import { useLang } from "../lang/LanguageContext";
import { useCart } from "../cart/CartContext";
import { formatMoney } from "../utils/order";
import { itemFromPrice, sectionMeta } from "../data/menu";
import { PlusIcon } from "./Icons";

const GOLD      = "#D4AF37";
const NAVY      = "#0B1F45";
const CREAM_BG  = "#FBF6EC";   // warm cream for emoji zone — same for ALL sections
const PRICE_CLR = "#8B6914";

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
        display: "flex", alignItems: "stretch",
        background: "#FFFFFF", borderRadius: "14px",
        overflow: "hidden",
        border: "1px solid rgba(212,175,55,0.18)",
        boxShadow: "0 2px 12px rgba(11,31,69,0.07)",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 22px rgba(11,31,69,0.14)"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(11,31,69,0.07)"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.18)"; }}
    >
      {/* Gold left accent — same for EVERY card, unified and elegant */}
      <div style={{ width: "5px", background: GOLD, flexShrink: 0 }} />

      {/* Emoji zone — warm cream, consistent */}
      <div style={{
        width: "70px", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: CREAM_BG, fontSize: "34px", userSelect: "none",
        alignSelf: "stretch",
      }}>
        {item.emoji}
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0, padding: "11px 10px" }}>
        <div style={{
          fontFamily: "Georgia, serif", fontSize: "13.5px",
          fontWeight: 700, color: NAVY, lineHeight: 1.3,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {item.name[lang]}
        </div>
        <div style={{
          fontSize: "11px", fontStyle: "italic",
          color: "rgba(11,31,69,0.38)", marginTop: "2px",
          overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
        }}>
          {item.name[lang === "sw" ? "en" : "sw"]}
        </div>
        <div style={{
          fontSize: "13px", fontWeight: 700, color: PRICE_CLR,
          marginTop: "7px", display: "flex", alignItems: "center", gap: "4px",
        }}>
          {item.sizes && (
            <span style={{ fontSize: "10px", fontWeight: 400, color: "rgba(11,31,69,0.38)" }}>
              {t("from")}
            </span>
          )}
          {formatMoney(from)}
        </div>
      </div>

      {/* Add button — navy circle, gold icon */}
      <div style={{ display: "flex", alignItems: "center", paddingRight: "12px", flexShrink: 0 }}>
        <button
          onClick={handleAdd}
          aria-label={`Add ${item.name[lang]}`}
          style={{
            background: NAVY, color: GOLD,
            border: `1.5px solid ${GOLD}`,
            borderRadius: "50%", width: "36px", height: "36px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "background 0.18s, color 0.18s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.color = NAVY; }}
          onMouseLeave={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = GOLD; }}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}
