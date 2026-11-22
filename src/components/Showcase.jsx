// Home-screen showcase (Popeyes-style): open/closed strip, Order Pickup / Delivery,
// "Order Again", and "Our Favorites" fed by Akili (Msimamizi) through the popular_dishes table.
import { useEffect, useState } from "react";
import { useLang } from "../lang/LanguageContext";
import { useCart } from "../cart/CartContext";
import { menu } from "../data/menu";
import { formatMoney } from "../utils/order";

const GOLD = "#D4AF37", NAVY = "#0B1F45", NAVY2 = "#06132E";

// Real photos of our plates (used when we have them; otherwise the menu photo/emoji)
const FAV_PHOTO = {
  "wali-combo":"/food/fav-wali.webp", "plate-wali":"/food/fav-wali.webp",
  "ugali-combo":"/food/fav-ugali.webp", "plate-ugali":"/food/fav-ugali.webp",
  "pilau-nyama":"/food/fav-pilau.webp", "pilau-choice":"/food/fav-pilau.webp",
};
// Shown until Akili has enough sales to choose the favorites
const DEFAULT_FAVS = ["wali-combo","ugali-combo","pilau-nyama","supu-kongoro"];

export const SERVICE_KEY = "jiko-service";
const byId = Object.fromEntries(menu.map(m => [m.id, m]));

function fromPrice(item, lang) {
  if (item.sizes && item.sizes.length) {
    const min = Math.min(...item.sizes.map(s => s.price));
    return (lang === "sw" ? "Kuanzia " : "From ") + formatMoney(min);
  }
  return formatMoney(item.price || 0);
}

/* ── Open / closed (Dar es Salaam time, 12:00 – 23:00) ── */
function useOpenNow() {
  const calc = () => {
    try {
      const parts = new Intl.DateTimeFormat("en-GB", { timeZone:"Africa/Dar_es_Salaam", hour:"2-digit", minute:"2-digit", hour12:false }).formatToParts(new Date());
      const h = parseInt(parts.find(p => p.type === "hour").value, 10);
      return h >= 12 && h < 23;
    } catch (e) { return null; }
  };
  const [open, setOpen] = useState(calc);
  useEffect(() => { const id = setInterval(() => setOpen(calc()), 60000); return () => clearInterval(id); }, []);
  return open;
}

export function OpenStrip() {
  const { lang } = useLang();
  const open = useOpenNow();
  return (
    <div style={{ background:NAVY, color:"#FDF5E4", padding:"9px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, fontFamily:"sans-serif", fontSize:12, borderBottom:"1px solid rgba(212,175,55,0.25)" }}>
      <span style={{ minWidth:0 }}>📍 <b>Goba Njia Nne</b>, Dar es Salaam</span>
      <span style={{ flexShrink:0, fontWeight:700, color: open === null ? "rgba(253,245,228,0.6)" : open ? "#6EE7A0" : "#FFB4A8" }}>
        {open === null ? "12:00 – 23:00" : open ? (lang === "sw" ? "● Tumefunguliwa" : "● Open now") : (lang === "sw" ? "● Tumefungwa · 12:00" : "● Closed · opens 12:00")}
      </span>
    </div>
  );
}

export function ServiceButtons({ goMenu }) {
  const { lang } = useLang();
  function pick(svc) {
    try { localStorage.setItem(SERVICE_KEY, svc); } catch (e) {}
    goMenu();
  }
  const btn = { flex:1, border:"none", borderRadius:99, padding:"14px 10px", fontFamily:"sans-serif", fontWeight:800, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 14px rgba(11,31,69,0.18)" };
  return (
    <div style={{ display:"flex", gap:10, padding:"16px 14px 6px" }}>
      <button onClick={() => pick("pickup")}   style={{ ...btn, background:GOLD, color:NAVY2 }}>🥡 {lang === "sw" ? "Agiza Kuchukua" : "Order Pickup"}</button>
      <button onClick={() => pick("delivery")} style={{ ...btn, background:NAVY, color:GOLD }}>🛵 {lang === "sw" ? "Agiza Delivery" : "Order Delivery"}</button>
    </div>
  );
}

/* ── Order Again — the last things this phone ordered ── */
export const LAST_KEY = "jiko-last-lines";
export function saveLastOrder(cart) {
  try {
    const seen = new Set(), lines = [];
    for (const l of cart) {
      const k = [l.itemId, l.sizeId || "", l.choiceId || ""].join("|");
      if (!seen.has(k)) { seen.add(k); lines.push({ ...l, qty:1 }); }
    }
    if (lines.length) localStorage.setItem(LAST_KEY, JSON.stringify(lines.slice(0, 8)));
  } catch (e) {}
}

export function OrderAgain() {
  const { lang } = useLang();
  const { addLine } = useCart();
  const [lines, setLines] = useState([]);
  const [added, setAdded] = useState({});
  useEffect(() => { try { const r = JSON.parse(localStorage.getItem(LAST_KEY) || "[]"); if (Array.isArray(r)) setLines(r.filter(l => l && l.name && l.unitPrice)); } catch (e) {} }, []);
  if (!lines.length) return null;
  return (
    <div style={{ padding:"14px 0 4px" }}>
      <h3 style={{ margin:"0 14px 8px", fontFamily:"Georgia,serif", fontSize:18, color:NAVY }}>{lang === "sw" ? "Agiza Tena" : "Order Again"}</h3>
      <div style={{ display:"flex", gap:10, overflowX:"auto", padding:"2px 14px 8px", scrollSnapType:"x proximity" }}>
        {lines.map((l, i) => {
          const m = byId[l.itemId];
          const label = (l.name && (l.name[lang] || l.name.sw)) || "";
          const sub = [l.sizeLabel && (l.sizeLabel[lang] || l.sizeLabel.sw || l.sizeLabel), l.choiceLabel && (l.choiceLabel[lang] || l.choiceLabel.sw || l.choiceLabel)].filter(x => typeof x === "string" && x).join(" · ");
          return (
            <div key={i} style={{ flex:"0 0 210px", scrollSnapAlign:"start", background:"#fff", borderRadius:14, padding:12, boxShadow:"0 2px 10px rgba(11,31,69,0.08)", border:"1px solid rgba(212,175,55,0.2)", display:"flex", flexDirection:"column" }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ width:52, height:52, borderRadius:10, background:"#F9F3E8", overflow:"hidden", flexShrink:0, display:"grid", placeItems:"center", fontSize:26 }}>
                  {m && (FAV_PHOTO[m.id] || m.photo) ? <img src={FAV_PHOTO[m.id] || m.photo} alt="" width={52} height={52} style={{ objectFit:"cover", width:52, height:52 }} onError={e => { e.target.style.display = "none"; }} /> : (m && m.emoji) || "🍽️"}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:"sans-serif", fontSize:12.5, fontWeight:700, color:NAVY, lineHeight:1.25, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{label}</div>
                  {sub && <div style={{ fontFamily:"sans-serif", fontSize:10.5, color:"rgba(11,31,69,0.55)", marginTop:2 }}>{sub}</div>}
                </div>
              </div>
              <div style={{ fontFamily:"sans-serif", fontSize:12, fontWeight:700, color:"#8B6209", margin:"8px 0" }}>{formatMoney(l.unitPrice)}</div>
              <button onClick={() => { addLine({ ...l, qty:1 }); setAdded(a => ({ ...a, [i]:true })); setTimeout(() => setAdded(a => ({ ...a, [i]:false })), 1200); }}
                style={{ marginTop:"auto", background: added[i] ? "#2E7D32" : NAVY, color: added[i] ? "#fff" : GOLD, border:"none", borderRadius:99, padding:"9px 10px", fontFamily:"sans-serif", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                {added[i] ? "✓ " + (lang === "sw" ? "Imeongezwa" : "Added") : (lang === "sw" ? "Weka kwenye Oda" : "Add to Bag")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Our Favorites (from Akili): food grid + best soft drinks / beers / gin & spirits ── */
const DRINK_KINDS = [
  { kind:"soft",    sw:"Vinywaji Baridi Vipendwa", en:"Top Soft Drinks",   icon:"🥤", adult:false },
  { kind:"beer",    sw:"Bia Zinazopendwa",         en:"Top Beers",         icon:"🍺", adult:true  },
  { kind:"spirits", sw:"Gin na Pombe Kali",        en:"Top Gin & Spirits", icon:"🥃", adult:true  },
];

// Dishes that are the same plate listed twice (e.g. the two Chapati lines) share one default photo.
// If the owner sets a photo on one of them in Msimamizi, its twins follow — unless they have a photo of their own.
function twinPhoto(m, edits) {
  if (!m || !m.photo) return null;
  for (const o of menu) {
    if (o.id !== m.id && o.photo === m.photo && edits[o.id] && edits[o.id].ph) return edits[o.id].ph;
  }
  return null;
}

// Name / photo / emoji for a dish or drink — follows whatever the owner sets in Msimamizi (menu edits + custom items)
function resolveItem(id, label, edits, customs) {
  const m = byId[id], e = edits[id] || {}, c = customs[id];
  if (e.hidden) return null;
  if (!m && !c) return null;
  return {
    id,
    name: { sw: e.sw || (m ? m.name.sw : c.sw) || label, en: e.en || (m ? m.name.en : (c.en || c.sw)) || label },
    photo: e.ph || (c && c.ph) || twinPhoto(m, edits) || FAV_PHOTO[id] || (m && m.photo) || null,
    emoji: e.em || (c && c.em) || (m && m.emoji) || "🍽️",
    menu: m || null,
  };
}

export function Favorites({ onPick }) {
  const { lang } = useLang();
  const [data, setData] = useState(null);   // { rows, edits, customs } once Akili's list is available
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { supabase } = await import("../lib/supabase");
        if (!supabase) return;
        let r = await supabase.from("popular_dishes").select("menu_id,label,rank,pinned,hidden,kind");
        if (r.error) r = await supabase.from("popular_dishes").select("menu_id,label,rank,pinned,hidden");   // "kind" column not added yet
        const rows = (!r.error && Array.isArray(r.data)) ? r.data : [];
        const e = await supabase.from("menu_item_edits").select("item_id,hidden,sw,en,em,ph");
        const c = await supabase.from("custom_menu_items").select("id,sw,en,em,ph,active").eq("active", true);
        const edits = {}; (e.data || []).forEach(x => { edits[x.item_id] = x; });
        const customs = {}; (c.data || []).forEach(x => { customs[x.id] = x; });
        if (alive) setData({ rows, edits, customs });
      } catch (err) { /* keep defaults */ }
    })();
    return () => { alive = false; };
  }, []);

  // Food (grid)
  let food;
  if (data) {
    food = data.rows.filter(x => !x.hidden && (x.kind || "food") === "food")
      .sort((a, b) => (b.pinned - a.pinned) || (a.rank - b.rank))
      .map(x => resolveItem(x.menu_id, x.label, data.edits, data.customs)).filter(Boolean).slice(0, 6)
      .map((it, i) => ({ ...it, rank: i + 1 }));
    if (!food.length) food = null;
  }
  const fromAkili = !!food;
  if (!food) food = DEFAULT_FAVS.filter(id => byId[id]).map(id => resolveItem(id, "", data ? data.edits : {}, data ? data.customs : {})).filter(Boolean).map((it, i) => ({ ...it, rank: i + 1 }));

  // Drinks (rails)
  const rails = data ? DRINK_KINDS.map(k => ({
    ...k,
    items: data.rows.filter(x => !x.hidden && x.kind === k.kind)
      .sort((a, b) => (b.pinned - a.pinned) || (a.rank - b.rank))
      .map(x => resolveItem(x.menu_id, x.label, data.edits, data.customs)).filter(Boolean).slice(0, 4),
  })).filter(k => k.items.length) : [];

  return (
    <div style={{ padding:"10px 14px 4px" }}>
      <h3 style={{ margin:"0 0 2px", fontFamily:"Georgia,serif", fontSize:18, color:NAVY }}>{lang === "sw" ? "Vipendwa vya Wateja" : "Crowd Favorites"}</h3>
      <p style={{ margin:"0 0 10px", fontFamily:"sans-serif", fontSize:11.5, color:"rgba(11,31,69,0.6)" }}>
        {fromAkili ? (lang === "sw" ? "Vinavyonunuliwa zaidi wiki hizi" : "What our guests order most lately") : (lang === "sw" ? "Mapishi ya Bibi yanayopendwa" : "Bibi's most-loved plates")}
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px, 164px))", justifyContent:"start", gap:10 }}>
        {food.map(f => (
          <button key={f.id} onClick={() => f.menu && onPick(f.menu)} style={{ textAlign:"left", background:"#fff", border:"1px solid rgba(212,175,55,0.22)", borderRadius:14, padding:0, cursor:"pointer", overflow:"hidden", boxShadow:"0 2px 10px rgba(11,31,69,0.08)", position:"relative", display:"flex", flexDirection:"column" }}>
            <div style={{ aspectRatio:"1 / 1", background:"#F9F3E8", display:"grid", placeItems:"center", fontSize:44, overflow:"hidden", position:"relative" }}>
              {f.photo ? <img src={f.photo} alt={f.name[lang]} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={e => { e.target.style.display = "none"; }} /> : f.emoji}
              {fromAkili && f.rank <= 3 && (
                <span style={{ position:"absolute", top:8, left:8, background:GOLD, color:NAVY2, fontFamily:"sans-serif", fontWeight:900, fontSize:10.5, padding:"3px 8px", borderRadius:99, boxShadow:"0 1px 6px rgba(0,0,0,0.25)" }}>
                  {f.rank === 1 ? "🔥 #1" : "#" + f.rank}
                </span>
              )}
            </div>
            <div style={{ padding:"9px 10px 11px" }}>
              <div style={{ fontFamily:"sans-serif", fontSize:12.5, fontWeight:700, color:NAVY, lineHeight:1.3, minHeight:34, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{f.name[lang]}</div>
            </div>
          </button>
        ))}
      </div>

      {rails.map(k => (
        <div key={k.kind} style={{ marginTop:18 }}>
          <h3 style={{ margin:"0 0 8px", fontFamily:"Georgia,serif", fontSize:16, color:NAVY, display:"flex", alignItems:"center", gap:8 }}>
            <span>{k.icon}</span><span>{lang === "sw" ? k.sw : k.en}</span>
            {k.adult && <span style={{ fontFamily:"sans-serif", fontSize:9.5, fontWeight:800, color:"#8B1A1A", border:"1px solid #8B1A1A", borderRadius:5, padding:"1px 5px" }}>18+</span>}
          </h3>
          <div style={{ display:"flex", gap:10, overflowX:"auto", margin:"0 -14px", padding:"2px 14px 8px", scrollSnapType:"x proximity" }}>
            {k.items.map((it, i) => (
              <div key={it.id} style={{ flex:"0 0 118px", scrollSnapAlign:"start", background:"#fff", borderRadius:12, overflow:"hidden", border:"1px solid rgba(212,175,55,0.22)", boxShadow:"0 2px 8px rgba(11,31,69,0.07)" }}>
                <div style={{ aspectRatio:"1 / 1", background:"#F9F3E8", display:"grid", placeItems:"center", fontSize:38, overflow:"hidden", position:"relative" }}>
                  {it.photo ? <img src={it.photo} alt={it.name[lang]} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={e => { e.target.style.display = "none"; }} /> : it.emoji}
                  {i === 0 && <span style={{ position:"absolute", top:6, left:6, background:GOLD, color:NAVY2, fontFamily:"sans-serif", fontWeight:900, fontSize:9.5, padding:"2px 7px", borderRadius:99 }}>🔥 #1</span>}
                </div>
                <div style={{ padding:"7px 8px 9px", fontFamily:"sans-serif", fontSize:11.5, fontWeight:700, color:NAVY, lineHeight:1.3, minHeight:34, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{it.name[lang]}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
