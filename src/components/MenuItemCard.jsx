import { useLang } from "../lang/LanguageContext";
import { useCart } from "../cart/CartContext";
import { useAdmin } from "../admin/AdminContext";
import { formatMoney } from "../utils/order";
import { itemFromPrice, sectionMeta } from "../data/menu";
import { PlusIcon } from "./Icons";

const GOLD      = "#D4AF37";
const NAVY      = "#0B1F45";
const CREAM_BG  = "#FBF6EC";
const PRICE_CLR = "#8B6914";
const RED       = "#C62828";

export default function MenuItemCard({ item, onConfigure }) {
  const { lang, t }  = useLang();
  const { addLine }  = useCart();
  const { prices, isOutOfStock } = useAdmin();
  const meta         = sectionMeta(item.section);
  const needsConfig  = Boolean(item.sizes || item.choices);
  const oos          = isOutOfStock(item.id);

  // Use admin price override if set, otherwise original price
  const displayFrom  = prices[item.id] !== undefined
    ? prices[item.id]
    : itemFromPrice(item);

  function handleAdd() {
    if (oos) return;
    if (needsConfig) {
      onConfigure(item);
    } else {
      addLine({ itemId: item.id, name: item.name, unitPrice: prices[item.id] ?? item.price, qty: 1 });
    }
  }

  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      background: "#FFFFFF", borderRadius: "14px",
      overflow: "hidden",
      border: `1px solid ${oos ? "rgba(198,40,40,0.2)" : "rgba(212,175,55,0.18)"}`,
      boxShadow: "0 2px 12px rgba(11,31,69,0.07)",
      opacity: oos ? 0.72 : 1,
    }}
    onMouseEnter={e => { if(!oos){ e.currentTarget.style.boxShadow="0 6px 22px rgba(11,31,69,0.14)"; e.currentTarget.style.borderColor="rgba(212,175,55,0.5)"; }}}
    onMouseLeave={e => { e.currentTarget.style.boxShadow="0 2px 12px rgba(11,31,69,0.07)"; e.currentTarget.style.borderColor=oos?"rgba(198,40,40,0.2)":"rgba(212,175,55,0.18)"; }}
    >
      {/* Left accent */}
      <div style={{ width:"5px", background: oos ? RED : GOLD, flexShrink:0 }} />

      {/* Emoji / Photo zone */}
      <div style={{
        width: item.photo ? "110px" : "70px", flexShrink:0, alignSelf:"stretch",
        display:"flex", alignItems:"center", justifyContent:"center",
        background: CREAM_BG, fontSize:"34px", userSelect:"none",
        position:"relative", overflow:"hidden",
      }}>
        {item.photo ? (
          <img src={item.photo} alt={item.name.sw}
            style={{ width:"100%", height:"100%", objectFit:"cover" }}
            onError={e => { e.target.style.display="none"; }}
          />
        ) : item.emoji}

        {/* Out of stock overlay */}
        {oos && (
          <div style={{
            position:"absolute", inset:0,
            background:"rgba(198,40,40,0.82)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <span style={{ color:"#fff", fontSize:"9px", fontFamily:"sans-serif", fontWeight:900, letterSpacing:"0.5px", textAlign:"center", lineHeight:1.2 }}>
              IME-<br/>ISHA
            </span>
          </div>
        )}
      </div>

      {/* Text */}
      <div style={{ flex:1, minWidth:0, padding:"11px 10px" }}>
        <div style={{
          fontFamily:"Georgia,serif", fontSize:"13.5px",
          fontWeight:700, color:NAVY, lineHeight:1.3,
          overflow:"hidden", display:"-webkit-box",
          WebkitLineClamp:2, WebkitBoxOrient:"vertical",
        }}>
          {item.name[lang]}
        </div>
        <div style={{
          fontSize:"11px", fontStyle:"italic",
          color:"rgba(11,31,69,0.38)", marginTop:"2px",
          overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis",
        }}>
          {item.name[lang === "sw" ? "en" : "sw"]}
        </div>
        <div style={{
          fontSize:"13px", fontWeight:700,
          color: oos ? RED : PRICE_CLR,
          marginTop:"7px", display:"flex", alignItems:"center", gap:"4px",
        }}>
          {oos ? (
            <span style={{ fontSize:"11px" }}>Haipatikani</span>
          ) : (
            <>
              {item.sizes && <span style={{ fontSize:"10px", fontWeight:400, color:"rgba(11,31,69,0.38)" }}>{t("from")}</span>}
              {formatMoney(displayFrom)}
              {prices[item.id] !== undefined && (
                <span style={{ fontSize:"9px", background:"rgba(27,107,32,0.12)", color:"#1B6B20", borderRadius:"4px", padding:"1px 5px", fontWeight:700 }}>Mpya</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add button */}
      <div style={{ display:"flex", alignItems:"center", paddingRight:"12px", flexShrink:0 }}>
        <button onClick={handleAdd} aria-label={`Add ${item.name[lang]}`}
          style={{
            background: oos ? "rgba(11,31,69,0.08)" : NAVY,
            color: oos ? "rgba(11,31,69,0.3)" : GOLD,
            border:`1.5px solid ${oos ? "rgba(11,31,69,0.15)" : GOLD}`,
            borderRadius:"50%", width:"36px", height:"36px",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor: oos ? "not-allowed" : "pointer",
            transition:"background 0.18s, color 0.18s",
          }}
          onMouseEnter={e => { if(!oos){ e.currentTarget.style.background=GOLD; e.currentTarget.style.color=NAVY; }}}
          onMouseLeave={e => { if(!oos){ e.currentTarget.style.background=NAVY; e.currentTarget.style.color=GOLD; }}}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}
