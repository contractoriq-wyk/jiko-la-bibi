// "Zawadi" tab — current offers (edited in Msimamizi → Ofa). Stamp card comes next.
import { useEffect, useState } from "react";
import { useLang } from "../lang/LanguageContext";

const GOLD = "#D4AF37", NAVY = "#0B1F45", NAVY2 = "#06132E";

export default function RewardsPage({ goMenu }) {
  const { lang } = useLang();
  const [offers, setOffers] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { supabase } = await import("../lib/supabase");
        if (!supabase) { if (alive) setOffers([]); return; }
        const { data, error } = await supabase.from("site_offers").select("id,title,body,price_text,badge,active,sort").eq("active", true).order("sort", { ascending:true });
        if (alive) setOffers(!error && Array.isArray(data) ? data : []);
      } catch (e) { if (alive) setOffers([]); }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="page-enter">
      <div style={{ background:"linear-gradient(160deg,#2d1808,#1a0d03 40%,#0B1F45 100%)", padding:"2.2rem 1.2rem 1.8rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(to right,transparent,#D4AF37,#f7e8a0,#D4AF37,transparent)" }} />
        <img src="/shield-sm.webp" alt="" width={54} height={60} style={{ objectFit:"contain", display:"block", margin:"0 auto 8px" }} onError={e => { e.target.style.display = "none"; }} />
        <h1 className="shimmer-gold l99-section-heading" style={{ fontSize:"clamp(20px,5vw,28px)", fontWeight:900, margin:"0 0 6px" }}>{lang === "sw" ? "Zawadi na Ofa" : "Rewards & Offers"}</h1>
        <p style={{ fontFamily:"'Great Vibes',Georgia,serif", color:"rgba(253,245,228,0.75)", fontSize:"clamp(15px,4vw,19px)", margin:0 }}>{lang === "sw" ? "Asante kwa kuwa mteja wetu" : "Thank you for being our guest"}</p>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"1.2rem 14px 1rem" }}>
        <h3 style={{ margin:"0 0 10px", fontFamily:"Georgia,serif", fontSize:18, color:NAVY }}>{lang === "sw" ? "Ofa za Sasa" : "Current Offers"}</h3>

        {offers === null && <p style={{ fontFamily:"sans-serif", fontSize:13, color:"rgba(11,31,69,0.5)" }}>…</p>}

        {offers && offers.length === 0 && (
          <div style={{ background:"#fff", borderRadius:14, padding:"1.4rem 1.2rem", textAlign:"center", border:"1px dashed rgba(212,175,55,0.5)" }}>
            <div style={{ fontSize:34, marginBottom:6 }}>🎁</div>
            <div style={{ fontFamily:"sans-serif", fontSize:13.5, color:NAVY, fontWeight:700 }}>{lang === "sw" ? "Hakuna ofa kwa sasa" : "No offers right now"}</div>
            <div style={{ fontFamily:"sans-serif", fontSize:12, color:"rgba(11,31,69,0.6)", marginTop:4 }}>{lang === "sw" ? "Tembelea tena hivi karibuni — Bibi ana mambo mazuri!" : "Check back soon — Bibi has good things coming!"}</div>
          </div>
        )}

        {offers && offers.map(o => (
          <div key={o.id} style={{ background:"#fff", borderRadius:14, marginBottom:12, overflow:"hidden", boxShadow:"0 2px 10px rgba(11,31,69,0.08)", border:"1px solid rgba(212,175,55,0.25)" }}>
            <div style={{ height:5, background:"repeating-linear-gradient(45deg,#D4AF37 0,#D4AF37 7px,#06132E 7px,#06132E 14px)" }} />
            <div style={{ padding:"14px 14px 14px" }}>
              {o.badge && <span style={{ display:"inline-block", background:"#0F766E", color:"#fff", fontFamily:"sans-serif", fontWeight:800, fontSize:10, letterSpacing:"0.8px", padding:"3px 9px", borderRadius:6, marginBottom:8 }}>{o.badge}</span>}
              <div style={{ fontFamily:"Georgia,serif", fontSize:17, fontWeight:700, color:NAVY, lineHeight:1.3 }}>{o.title}</div>
              {o.body && <p style={{ fontFamily:"sans-serif", fontSize:13, color:"rgba(11,31,69,0.72)", lineHeight:1.6, margin:"6px 0 0", whiteSpace:"pre-line" }}>{o.body}</p>}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginTop:12 }}>
                <span style={{ fontFamily:"sans-serif", fontWeight:800, fontSize:15, color:"#8B6209" }}>{o.price_text}</span>
                <button onClick={goMenu} style={{ background:NAVY, color:GOLD, border:"none", borderRadius:99, padding:"9px 18px", fontFamily:"sans-serif", fontWeight:700, fontSize:12.5, cursor:"pointer" }}>{lang === "sw" ? "Agiza" : "Order"} →</button>
              </div>
            </div>
          </div>
        ))}

        <div style={{ background:"linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.04))", border:"1px solid rgba(212,175,55,0.35)", borderRadius:14, padding:"1rem 1.1rem", marginTop:16, display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ fontSize:30 }}>⭐</div>
          <div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:15, fontWeight:700, color:NAVY }}>{lang === "sw" ? "Kadi ya Mihuri — inakuja!" : "Stamp Card — coming soon!"}</div>
            <div style={{ fontFamily:"sans-serif", fontSize:12, color:"rgba(11,31,69,0.65)", marginTop:2, lineHeight:1.5 }}>{lang === "sw" ? "Kusanya mihuri kila unaponunua, upate zawadi bure." : "Collect a stamp with every order and earn free treats."}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
