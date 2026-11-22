// "Zawadi" tab — stamp card + current offers (offers edited in Msimamizi → Tovuti).
import { useEffect, useState } from "react";
import { useLang } from "../lang/LanguageContext";

const GOLD = "#D4AF37", NAVY = "#0B1F45", NAVY2 = "#06132E";


// ── Stamp card: customer looks up THEIR balance by phone (server only returns that one number) ──
const STAMP_KEY = "jiko-stamp-phone";
function normPhone(p) {
  let d = String(p || "").replace(/[^0-9]/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "255" + d.slice(1);
  else if (d.length === 9 && /^[67]/.test(d)) d = "255" + d;
  return /^255[67]\d{8}$/.test(d) ? d : "";
}
function StampCard() {
  const { lang } = useLang();
  const sw = lang === "sw";
  const [goal, setGoal] = useState(10);
  const [reward, setReward] = useState("Kinywaji Bure / Free drink");
  const [phone, setPhone] = useState(() => { try { return localStorage.getItem(STAMP_KEY) || ""; } catch (e) { return ""; } });
  const [input, setInput] = useState("");
  const [bal, setBal] = useState(null);       // {stamps, redeemed}
  const [state, setState] = useState("idle"); // idle | loading | error
  const [bad, setBad] = useState(false);

  useEffect(() => {   // owner's goal + reward text
    (async () => {
      try {
        const { supabase } = await import("../lib/supabase"); if (!supabase) return;
        const { data } = await supabase.from("site_flags").select("*").eq("id", "main").limit(1);
        const f = data && data[0]; if (!f) return;
        if (f.stamp_goal > 0) setGoal(Math.min(f.stamp_goal, 20));
        if (f.stamp_reward) setReward(f.stamp_reward);
      } catch (e) { /* defaults */ }
    })();
  }, []);

  useEffect(() => {
    if (!phone) { setBal(null); return; }
    let alive = true; setState("loading");
    (async () => {
      try {
        const { supabase } = await import("../lib/supabase");
        if (!supabase) throw new Error("no-db");
        const { data, error } = await supabase.rpc("stamp_balance", { p_phone: phone });
        if (error) throw error;
        if (alive) { setBal(data || { stamps: 0, redeemed: 0 }); setState("idle"); }
      } catch (e) { if (alive) setState("error"); }
    })();
    return () => { alive = false; };
  }, [phone]);

  function look() {
    const n = normPhone(input);
    if (!n) { setBad(true); return; }
    setBad(false); try { localStorage.setItem(STAMP_KEY, n); } catch (e) { /* ignore */ }
    setPhone(n);
  }
  function change() { try { localStorage.removeItem(STAMP_KEY); } catch (e) { /* ignore */ } setPhone(""); setBal(null); setInput(""); }

  const stamps = bal ? bal.stamps : 0;
  const ready = bal && stamps >= goal;
  const left = Math.max(goal - stamps, 0);
  const shown = Math.min(stamps, goal);

  return (
    <div style={{ background:"#fff", borderRadius:16, marginTop:16, overflow:"hidden", boxShadow:"0 2px 12px rgba(11,31,69,0.1)", border:"1px solid rgba(212,175,55,0.35)" }}>
      <div style={{ background:"linear-gradient(135deg,#0B1F45,#06132E)", padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:24 }}>⭐</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"Georgia,serif", fontSize:16, fontWeight:700, color:GOLD }}>{sw ? "Kadi ya Mihuri" : "Stamp Card"}</div>
          <div style={{ fontFamily:"sans-serif", fontSize:11.5, color:"rgba(253,245,228,0.75)", lineHeight:1.4 }}>{sw ? "Muhuri 1 kwa kila agizo. Mihuri " + goal + " = " : "1 stamp per order. " + goal + " stamps = "}<b style={{ color:GOLD }}>{reward}</b></div>
        </div>
      </div>
      <div style={{ padding:"14px 14px 16px" }}>
        {!phone && (
          <>
            <label style={{ fontFamily:"sans-serif", fontSize:12, fontWeight:700, color:NAVY, display:"block", marginBottom:6 }}>{sw ? "Ingiza namba yako ya simu uone mihuri yako" : "Enter your phone number to see your stamps"}</label>
            <div style={{ display:"flex", gap:8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") look(); }} inputMode="tel" maxLength={20} placeholder="07xx xxx xxx" style={{ flex:1, minWidth:0, padding:"11px 12px", borderRadius:10, border:"1px solid " + (bad ? "#B42318" : "rgba(11,31,69,0.2)"), fontSize:15, fontFamily:"sans-serif", outline:"none", boxSizing:"border-box" }} />
              <button onClick={look} style={{ background:GOLD, color:NAVY2, border:"none", borderRadius:10, padding:"0 16px", fontFamily:"sans-serif", fontWeight:800, fontSize:13, cursor:"pointer" }}>{sw ? "Angalia" : "Check"}</button>
            </div>
            {bad && <div style={{ fontFamily:"sans-serif", fontSize:11.5, color:"#B42318", marginTop:6 }}>{sw ? "Namba si sahihi — tumia tarakimu 10, mfano 0712345678" : "Invalid number — use 10 digits, e.g. 0712345678"}</div>}
            <div style={{ fontFamily:"sans-serif", fontSize:11, color:"rgba(11,31,69,0.55)", marginTop:8, lineHeight:1.5 }}>{sw ? "Mhudumu atakuwekea muhuri kila unaponunua. Tumia namba ile ile kila mara." : "Our staff will add a stamp each time you order. Use the same number every time."}</div>
          </>
        )}
        {phone && state === "loading" && <div style={{ fontFamily:"sans-serif", fontSize:13, color:"rgba(11,31,69,0.5)", textAlign:"center", padding:"10px 0" }}>…</div>}
        {phone && state === "error" && (
          <div style={{ textAlign:"center", fontFamily:"sans-serif", fontSize:12.5, color:"rgba(11,31,69,0.7)", lineHeight:1.6 }}>
            {sw ? "Kadi haipatikani kwa sasa. Jaribu tena baadaye." : "Could not load your card right now. Please try again later."}
            <div><button onClick={change} style={{ marginTop:8, background:"none", border:"none", color:"#8B6209", fontWeight:700, fontSize:12, cursor:"pointer", textDecoration:"underline" }}>{sw ? "Badilisha namba" : "Change number"}</button></div>
          </div>
        )}
        {phone && bal && state === "idle" && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:8, maxWidth:330, margin:"0 auto" }}>
              {Array.from({ length: goal }).map((_, i) => {
                const on = i < shown;
                return (
                  <div key={i} style={{ aspectRatio:"1 / 1", borderRadius:"50%", display:"grid", placeItems:"center", fontSize:17, fontWeight:900, fontFamily:"sans-serif",
                    background: on ? "linear-gradient(135deg,#E8C547,#B8860B)" : "rgba(11,31,69,0.05)", color: on ? NAVY2 : "rgba(11,31,69,0.25)",
                    border: on ? "2px solid #8B6209" : "2px dashed rgba(11,31,69,0.22)", boxShadow: on ? "0 2px 6px rgba(139,98,9,0.35)" : "none" }}>
                    {on ? "★" : i + 1}
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign:"center", marginTop:12, fontFamily:"sans-serif" }}>
              {ready ? (
                <div style={{ background:"#ECFDF3", border:"1px solid #12B76A", borderRadius:12, padding:"10px 12px" }}>
                  <div style={{ fontSize:15, fontWeight:800, color:"#067647" }}>🎁 {sw ? "Hongera! Una zawadi: " : "Congratulations! You earned: "}{reward}</div>
                  <div style={{ fontSize:12, color:"#067647", marginTop:3 }}>{sw ? "Mwonyeshe mhudumu skrini hii wakati wa kuagiza." : "Show this screen to our staff when you order."}</div>
                </div>
              ) : (
                <div style={{ fontSize:13.5, color:NAVY, fontWeight:700 }}>
                  {stamps === 0 ? (sw ? "Bado huna muhuri — agiza leo uanze!" : "No stamps yet — order today to start!") : (sw ? "Una mihuri " + stamps + " — bado " + left + " upate " : "You have " + stamps + " — " + left + " more to get ")}
                  {stamps > 0 && <span style={{ color:"#8B6209" }}>{reward}</span>}
                </div>
              )}
              {bal.redeemed > 0 && <div style={{ fontSize:11.5, color:"rgba(11,31,69,0.55)", marginTop:6 }}>{sw ? "Zawadi ulizopata tayari: " : "Rewards already received: "}{bal.redeemed}</div>}
              <div style={{ fontSize:11, color:"rgba(11,31,69,0.5)", marginTop:8 }}>📱 {"0" + phone.slice(3)} · <button onClick={change} style={{ background:"none", border:"none", color:"#8B6209", fontWeight:700, fontSize:11, cursor:"pointer", textDecoration:"underline", padding:0 }}>{sw ? "Badilisha namba" : "Change number"}</button></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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
        <StampCard />

        <h3 style={{ margin:"18px 0 10px", fontFamily:"Georgia,serif", fontSize:18, color:NAVY }}>{lang === "sw" ? "Ofa za Sasa" : "Current Offers"}</h3>

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

      </div>
    </div>
  );
}
