// Slide-in side menu (the ☰ button) — About, Policies, Careers (when hiring), WhatsApp, language, Msimamizi.
import { useEffect, useState } from "react";
import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";

const GOLD = "#D4AF37", NAVY = "#0B1F45", NAVY2 = "#06132E";

export default function MenuDrawer({ open, onClose, go }) {
  const { lang, toggle } = useLang();
  const [hiring, setHiring] = useState(false);
  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        const { supabase } = await import("../lib/supabase");
        if (!supabase) return;
        const { data } = await supabase.from("site_flags").select("hiring_open").eq("id", "main").maybeSingle();
        if (alive && data && data.hiring_open === true) setHiring(true);
      } catch (e) {}
    })();
    return () => { alive = false; };
  }, [open]);
  if (!open) return null;

  const sw = lang === "sw";
  const row = { display:"flex", alignItems:"center", gap:12, width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:"1px solid rgba(212,175,55,0.15)", padding:"15px 18px", color:"#FDF5E4", fontFamily:"sans-serif", fontSize:15, cursor:"pointer", textDecoration:"none" };
  const wa = "https://wa.me/" + business.whatsapp + "?text=" + encodeURIComponent(sw ? "Habari Jiko La Bibi JJJ, ningependa kuuliza..." : "Hello Jiko La Bibi JJJ, I would like to ask...");

  return (
    <div style={{ position:"fixed", inset:0, zIndex:80 }} onClick={onClose}>
      <div style={{ position:"absolute", inset:0, background:"rgba(6,19,46,0.6)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position:"absolute", top:0, bottom:0, left:0, width:"82%", maxWidth:340, background:"linear-gradient(180deg,#0B1F45,#06132E)", boxShadow:"6px 0 28px rgba(0,0,0,0.4)", display:"flex", flexDirection:"column", overflowY:"auto" }}>
        <div style={{ padding:"18px 18px 14px", display:"flex", alignItems:"center", gap:12, borderBottom:"2px solid "+GOLD }}>
          <img src="/shield-sm.webp" alt="" width={44} height={49} style={{ objectFit:"contain" }} onError={e => { e.target.style.display = "none"; }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"Georgia,serif", fontWeight:700, color:GOLD, fontSize:16, lineHeight:1.2 }}>{business.shortName}</div>
            <div style={{ fontFamily:"sans-serif", fontSize:11, color:"rgba(253,245,228,0.6)", fontStyle:"italic" }}>Taste of Tanzania in DAR</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background:"none", border:"none", color:"rgba(253,245,228,0.7)", fontSize:24, cursor:"pointer" }}>✕</button>
        </div>

        <button style={row} onClick={() => go("home")}>🏠 {sw ? "Nyumbani" : "Home"}</button>
        <button style={row} onClick={() => go("menu")}>🍽️ {sw ? "Menyu" : "Menu"}</button>
        <button style={row} onClick={() => go("rewards")}>🎁 {sw ? "Zawadi na Ofa" : "Rewards & Offers"}</button>
        <button style={row} onClick={() => go("about")}>🏡 {sw ? "Kuhusu Sisi" : "About Us"}</button>
        <button style={row} onClick={() => go("policy")}>📜 {sw ? "Sera na Kanuni" : "Policies"}</button>
        {hiring && <a style={row} href="/ajira.html?src=web">💼 {sw ? "Tunaajiri — Omba Kazi" : "We're Hiring — Apply"}</a>}
        <a style={row} href={wa} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
        <button style={row} onClick={toggle}>🌐 {sw ? "Language: English" : "Lugha: Kiswahili"}</button>

        <div style={{ marginTop:"auto", padding:"14px 18px 18px" }}>
          <button onClick={() => go("admin")} style={{ background:"none", border:"1px solid rgba(212,175,55,0.3)", color:"rgba(253,245,228,0.55)", borderRadius:99, padding:"8px 16px", fontFamily:"sans-serif", fontSize:11, cursor:"pointer" }}>🔒 Msimamizi</button>
        </div>
      </div>
    </div>
  );
}
