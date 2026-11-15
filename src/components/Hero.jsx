import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";

export default function Hero() {
  const { lang, t } = useLang();

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
      <img
        src="/banner.jpg"
        alt="Unyamwezini Jiko La Bibi JJJ — Taste of Tanzania in DAR"
        style={{ display:"block", width:"100%", height:"auto" }}
      />

      {/* Gold edge */}
      <div style={{ height:"2px", background:"linear-gradient(to right,transparent,#6b4e0a,#D4AF37,#f7e8a0,#D4AF37,#6b4e0a,transparent)" }} />

      {/* Buttons */}
      <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", justifyContent:"center", padding:"16px 14px 18px" }}>
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
      </div>

      {/* Kanga stripe */}
      <div style={{
        height:"6px",
        background:"repeating-linear-gradient(45deg,#D4AF37 0,#D4AF37 7px,#06132E 7px,#06132E 14px)",
      }} />
    </section>
  );
}
