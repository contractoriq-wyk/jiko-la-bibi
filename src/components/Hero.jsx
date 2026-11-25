import { useEffect, useRef } from "react";
import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";

export default function Hero({ compact = false }) {
  const { lang, t } = useLang();
  const vref = useRef(null);
  const reduceMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Start the clip by hand too: some phones ignore autoplay until the first touch or scroll.
  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    const go = () => { const r = v.play(); if (r && r.catch) r.catch(() => {}); };
    go();
    const kick = () => { go(); };
    window.addEventListener("touchstart", kick, { once:true, passive:true });
    window.addEventListener("scroll", kick, { once:true, passive:true });
    window.addEventListener("click", kick, { once:true });
    return () => {
      window.removeEventListener("touchstart", kick);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("click", kick);
    };
  }, []);

  function handleWA() {
    const text = encodeURIComponent(
      lang === "sw"
        ? "Habari Jiko La Bibi JJJ, ningependa kuagiza..."
        : "Hello Jiko La Bibi JJJ, I would like to order..."
    );
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) {
      window.location.href = `intent://send?phone=${business.whatsapp}&text=${text}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end`;
    } else {
      window.open(`https://wa.me/${business.whatsapp}?text=${text}`, "_blank");
    }
  }

  // Clean top banner: just the picture (it already carries the name and tagline),
  // then the two buttons customers actually use. The header above shows the logo and name.
  return (
    <section id="top" style={{ position:"relative", background:"#06132E" }}>
      <div id="jlb-hero" style={{ position:"relative", overflow:"hidden", lineHeight:0 }}>
        {/* Still picture: sets the size and shows first / if video cannot play */}
        <img
          src="/banner.jpg"
          alt="Unyamwezini Jiko La Bibi JJJ — Taste of Tanzania in DAR"
          style={{ display:"block", width:"100%", height:"auto" }}
        />
        {/* Moving banner (muted, looping, plays inline on phones) */}
        {!reduceMotion && (
          <video
            ref={vref}
            src="/banner.mp4?v=14"
            poster="/banner.jpg"
            autoPlay muted loop playsInline preload="auto"
            aria-hidden="true"
            onPlaying={e => { e.currentTarget.style.opacity = 1; }}
            onLoadedData={e => { e.currentTarget.style.opacity = 1; }}
            onError={e => { e.currentTarget.style.display = "none"; }}
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover",
              opacity:0, transition:"opacity .5s", pointerEvents:"none" }}
          />
        )}
      </div>

      {/* Gold edge */}
      <div style={{ height:"2px", background:"linear-gradient(to right,transparent,#6b4e0a,#D4AF37,#f7e8a0,#D4AF37,#6b4e0a,transparent)" }} />

      {/* Buttons (hidden on the new home screen, which has its own Order Pickup / Delivery buttons) */}
      {!compact && <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", justifyContent:"center", padding:"16px 14px 18px" }}>
        <a href="#menu" style={{
          background:"#D4AF37", color:"#06132E",
          borderRadius:"99px", padding:"12px 30px",
          fontFamily:"sans-serif", fontWeight:700, fontSize:"14px",
          textDecoration:"none", display:"inline-block",
          boxShadow:"0 4px 16px rgba(212,175,55,0.35)",
        }}>
          {lang === "sw" ? "Tazama Menyu" : "View Menu"} →
        </a>
        <button onClick={handleWA} style={{
          background:"#25d366", color:"#fff",
          border:"none", borderRadius:"99px", padding:"12px 26px",
          fontFamily:"sans-serif", fontWeight:700, fontSize:"14px",
          cursor:"pointer", display:"flex", alignItems:"center", gap:"7px",
          boxShadow:"0 4px 16px rgba(37,211,102,0.3)",
        }}>
          <i className="ti ti-brand-whatsapp" style={{ fontSize:"18px" }} />
          WhatsApp Business
        </button>
      </div>}

      {/* Kanga stripe */}
      <div style={{
        height:"6px",
        background:"repeating-linear-gradient(45deg,#D4AF37 0,#D4AF37 7px,#06132E 7px,#06132E 14px)",
      }} />
    </section>
  );
}
