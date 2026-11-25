// Home-screen showcase (Popeyes-style): open/closed strip, Order Pickup / Delivery,
// "Order Again", and "Our Favorites" fed by Akili (Msimamizi) through the popular_dishes table.
import { useEffect, useRef, useState } from "react";
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
const FAV_MEAL_SECTIONS = ["mchele","standard","pilau","specials","jioni"];
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

// Showcase rail: drifts by itself like the gold ribbon, but it is a real swipe row —
// the moment a finger / mouse / arrow touches it the drifting stops, you swipe freely and tap any dish right away,
// and it drifts again only after ~3 seconds of being left alone. Three copies in a row make the loop seamless both ways.
function Marquee({ count, cardW, gap = 10, speed = 28, reverse = false, render }) {
  const box = useRef(null);
  const st = useRef({ pos:0, last:0, quiet:0, vis:true, half:1 });
  const [still, setStill] = useState(false);   // "reduce motion": plain swipe row, one copy
  const reps = Math.max(1, Math.ceil(900 / (count * (cardW + gap))));
  const unit = [];
  for (let r = 0; r < reps; r++) for (let i = 0; i < count; i++) unit.push(i);
  const copies = still ? 1 : 3;

  useEffect(() => {
    const mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    const apply = () => setStill(!!(mq && mq.matches));
    apply();
    if (mq && mq.addEventListener) mq.addEventListener("change", apply);
    return () => { if (mq && mq.removeEventListener) mq.removeEventListener("change", apply); };
  }, []);

  useEffect(() => {
    const el = box.current; if (!el) return;
    const S = st.current;
    const half = () => unit.length * (cardW + gap);
    S.half = half();
    if (still) { el.scrollLeft = 0; return; }
    el.scrollLeft = S.half; S.pos = S.half;                       // start on the middle copy
    const touch = () => { S.quiet = performance.now() + 3000; };
    const wrap = () => {                                           // keep the user inside the middle copy range
      const h = S.half, sl = el.scrollLeft;
      if (sl < h * 0.5) { el.scrollLeft = sl + h; S.pos = el.scrollLeft; }
      else if (sl > h * 1.5) { el.scrollLeft = sl - h; S.pos = el.scrollLeft; }
    };
    let idleT = null;
    const onScroll = () => { clearTimeout(idleT); idleT = setTimeout(() => { if (performance.now() >= S.quiet - 2800) wrap(); }, 160); };
    const ev = ["touchstart","touchmove","pointerdown","wheel","mouseenter","focusin","keydown"];
    ev.forEach(e => el.addEventListener(e, touch, { passive:true }));
    el.addEventListener("scroll", onScroll, { passive:true });
    let io = null;
    if (window.IntersectionObserver) { io = new IntersectionObserver(es => { S.vis = es[0].isIntersecting; }, { threshold:0 }); io.observe(el); }
    let raf = 0; S.last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - S.last) / 1000); S.last = now;
      if (S.vis && !document.hidden) {
        if (now < S.quiet) { S.pos = el.scrollLeft; }              // user is in charge: follow where they are
        else {
          S.pos += (reverse ? -1 : 1) * speed * dt;
          if (S.pos >= S.half * 1.5) S.pos -= S.half; else if (S.pos <= S.half * 0.5) S.pos += S.half;
          el.scrollLeft = S.pos;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(idleT); if (io) io.disconnect(); ev.forEach(e => el.removeEventListener(e, touch)); el.removeEventListener("scroll", onScroll); };
  }, [still, count, cardW, gap, speed, reverse]);

  const nudge = (dir) => {
    const el = box.current; if (!el) return;
    st.current.quiet = performance.now() + 3500;
    el.scrollBy({ left: dir * (cardW + gap) * 2, behavior:"smooth" });
  };
  const arrow = (dir) => (
    <button type="button" aria-label={dir < 0 ? "Previous" : "Next"} onClick={() => nudge(dir)}
      style={{ position:"absolute", top:"38%", [dir < 0 ? "left" : "right"]:2, width:30, height:30, borderRadius:"50%", border:"1px solid rgba(212,175,55,0.6)", background:"rgba(11,31,69,0.72)", color:"#F7E8A0", fontSize:18, lineHeight:"26px", padding:0, cursor:"pointer", zIndex:2, boxShadow:"0 2px 8px rgba(0,0,0,0.25)" }}>
      {dir < 0 ? "‹" : "›"}
    </button>
  );
  return (
    <div style={{ position:"relative", margin:"0 -14px" }}>
      <style>{`.jlb-rail::-webkit-scrollbar{display:none}`}</style>
      <div ref={box} className="jlb-rail" style={{ display:"flex", overflowX:"auto", padding:"2px 14px 8px", scrollbarWidth:"none", msOverflowStyle:"none", WebkitOverflowScrolling:"touch", overscrollBehaviorX:"contain" }}>
        {Array.from({ length: copies }).map((_, c) => unit.map((i, k) => {
          const dup = c > 0 || k >= count;
          if (still && dup) return null;
          return (
            <div key={c + "-" + k} aria-hidden={dup ? true : undefined} style={{ flex:"0 0 " + cardW + "px", marginRight:gap }}>{render(i, dup)}</div>
          );
        }))}
      </div>
      {arrow(-1)}{arrow(1)}
    </div>
  );
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
  const extra = data ? { edits:data.edits, customs:data.customs } : { edits:{}, customs:{} };
  if (!food) food = [];
  // Always show a full row of six: if Akili has fewer (few sales yet, or one dish hidden), top up with Bibi's own best plates
  if (food.length < 6) {
    const have = new Set(food.map(f => f.id));
    const pool = [...DEFAULT_FAVS, ...menu.filter(m => FAV_MEAL_SECTIONS.includes(m.section)).map(m => m.id)];
    const cands = [];
    for (const id of pool) {
      if (have.has(id) || !byId[id]) continue;
      if (data && data.rows.some(x => x.menu_id === id && x.hidden)) continue;   // owner hid it in Tovuti
      const it = resolveItem(id, "", extra.edits, extra.customs);
      if (it && !cands.some(c => c.id === id)) cands.push(it);
    }
    cands.sort((a, b) => (b.photo ? 1 : 0) - (a.photo ? 1 : 0));                 // pictures first, emoji-only plates last
    for (const it of cands) { if (food.length >= 6) break; food.push({ ...it, pad: true }); }
  }
  food = food.map((it, i) => ({ ...it, rank: i + 1 }));

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
      <Marquee count={food.length} cardW={156} speed={30} render={(i, dup) => { const f = food[i]; return (
          <button onClick={() => f.menu && onPick(f.menu)} tabIndex={dup ? -1 : 0} style={{ width:"100%", textAlign:"left", background:"#fff", border:"1px solid rgba(212,175,55,0.22)", borderRadius:14, padding:0, cursor:"pointer", overflow:"hidden", boxShadow:"0 2px 10px rgba(11,31,69,0.08)", position:"relative", display:"flex", flexDirection:"column" }}>
            <div style={{ aspectRatio:"1 / 1", background:"#F9F3E8", display:"grid", placeItems:"center", fontSize:44, overflow:"hidden", position:"relative" }}>
              {f.photo ? <img src={f.photo} alt={dup ? "" : f.name[lang]} loading="lazy" draggable={false} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={e => { e.target.style.display = "none"; }} /> : f.emoji}
              {fromAkili && !f.pad && f.rank <= 3 && (
                <span style={{ position:"absolute", top:8, left:8, background:GOLD, color:NAVY2, fontFamily:"sans-serif", fontWeight:900, fontSize:10.5, padding:"3px 8px", borderRadius:99, boxShadow:"0 1px 6px rgba(0,0,0,0.25)" }}>
                  {f.rank === 1 ? "🔥 #1" : "#" + f.rank}
                </span>
              )}
            </div>
            <div style={{ padding:"9px 10px 11px" }}>
              <div style={{ fontFamily:"sans-serif", fontSize:12.5, fontWeight:700, color:NAVY, lineHeight:1.3, minHeight:34, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{f.name[lang]}</div>
            </div>
          </button>); }} />

      {rails.map((k, ri) => (
        <div key={k.kind} style={{ marginTop:18 }}>
          <h3 style={{ margin:"0 0 8px", fontFamily:"Georgia,serif", fontSize:16, color:NAVY, display:"flex", alignItems:"center", gap:8 }}>
            <span>{k.icon}</span><span>{lang === "sw" ? k.sw : k.en}</span>
            {k.adult && <span style={{ fontFamily:"sans-serif", fontSize:9.5, fontWeight:800, color:"#8B1A1A", border:"1px solid #8B1A1A", borderRadius:5, padding:"1px 5px" }}>18+</span>}
          </h3>
          <Marquee count={k.items.length} cardW={118} speed={26} reverse={ri % 2 === 1} render={(i) => { const it = k.items[i]; return (
              <div style={{ background:"#fff", borderRadius:12, overflow:"hidden", border:"1px solid rgba(212,175,55,0.22)", boxShadow:"0 2px 8px rgba(11,31,69,0.07)" }}>
                <div style={{ aspectRatio:"1 / 1", background:"#F9F3E8", display:"grid", placeItems:"center", fontSize:38, overflow:"hidden", position:"relative" }}>
                  {it.photo ? <img src={it.photo} alt={it.name[lang]} loading="lazy" draggable={false} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={e => { e.target.style.display = "none"; }} /> : it.emoji}
                  {i === 0 && <span style={{ position:"absolute", top:6, left:6, background:GOLD, color:NAVY2, fontFamily:"sans-serif", fontWeight:900, fontSize:9.5, padding:"2px 7px", borderRadius:99 }}>🔥 #1</span>}
                </div>
                <div style={{ padding:"7px 8px 9px", fontFamily:"sans-serif", fontSize:11.5, fontWeight:700, color:NAVY, lineHeight:1.3, minHeight:34, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{it.name[lang]}</div>
              </div>); }} />
        </div>
      ))}
    </div>
  );
}
