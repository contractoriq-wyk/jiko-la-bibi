import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";

const FOODS = [
  { e:"☕", n:"Chai" },  { e:"🍛", n:"Pilau" },  { e:"🍗", n:"Kuku" },
  { e:"🫕", n:"Wali" },  { e:"🍟", n:"Chips" },  { e:"🍲", n:"Kongoro" },
  { e:"🧃", n:"Juice" }, { e:"🫓", n:"Chapati" }, { e:"🌾", n:"Ndizi" },
];

export default function Hero() {
  const { lang } = useLang();

  const waText = encodeURIComponent(
    lang === "sw"
      ? "Habari Jiko La Bibi JJJ, ningependa kuagiza..."
      : "Hello Jiko La Bibi JJJ, I would like to order..."
  );
  const waUrl = `https://wa.me/${business.whatsapp}?text=${waText}`;

  function handleWA(e) {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) {
      e.preventDefault();
      window.location.href = `intent://send?phone=${business.whatsapp}&text=${waText}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end`;
    }
  }

  return (
    <>
      {/* ══ HERO SECTION ══ */}
      <section id="top" style={{ position:"relative", overflow:"hidden", minHeight:"540px" }}>

        {/* Banner */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"url(/banner.jpg)",
          backgroundSize:"cover",
          backgroundPosition:"center 25%",
          filter:"brightness(0.72)",
        }} />

        {/* Overlay */}
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(165deg,rgba(6,19,46,0.78) 0%,rgba(11,31,69,0.52) 50%,rgba(6,19,46,0.42) 100%)",
        }} />

        {/* Content */}
        <div style={{
          position:"relative", zIndex:1,
          maxWidth:"880px", margin:"0 auto",
          padding:"2.8rem 1.25rem 2rem",
          display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center",
        }}>

          {/* Heritage badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            border:"1px solid rgba(212,175,55,0.5)", borderRadius:"99px",
            padding:"4px 18px", marginBottom:"1.2rem",
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#D4AF37" }} />
            <span style={{ color:"#D4AF37", fontSize:"10px", fontFamily:"sans-serif", letterSpacing:"3px", fontWeight:700 }}>
              KWA LADHA HALISI YA NYUMBANI
            </span>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#D4AF37" }} />
          </div>

          {/* Logo */}
          <div style={{ position:"relative", marginBottom:"1.4rem" }}>
            <div style={{ position:"absolute", inset:"-10px", borderRadius:"50%", border:"1px solid rgba(212,175,55,0.35)" }} />
            <div style={{ position:"absolute", inset:"-20px", borderRadius:"50%", border:"1px solid rgba(212,175,55,0.15)" }} />
            <img
              src="/logo.png"
              alt="Unyamwezini Jiko La Bibi JJJ"
              width={170} height={170}
              style={{ borderRadius:"50%", border:"4px solid #D4AF37", objectFit:"cover", display:"block" }}
              onError={e => { e.target.style.display="none"; }}
            />
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily:"Georgia,serif",
            fontSize:"clamp(30px,6vw,56px)",
            fontWeight:900, lineHeight:1.08,
            color:"#FDF5E4", margin:"0 0 8px",
            textShadow:"0 2px 8px rgba(0,0,0,0.5)",
          }}>
            Unyamwezini<br />
            <span style={{ color:"#D4AF37" }}>Jiko La Bibi JJJ</span>
          </h1>

          <p style={{
            fontFamily:"Georgia,serif",
            fontSize:"clamp(15px,3vw,21px)",
            fontStyle:"italic",
            color:"rgba(253,245,228,0.82)",
            margin:"0 0 1.2rem",
            textShadow:"0 1px 4px rgba(0,0,0,0.4)",
          }}>
            {lang === "sw" ? business.tagline_sw : business.tagline_en}
          </p>

          {/* FRESHI · LADHA · SAFI */}
          <div style={{
            display:"inline-flex", gap:"10px", alignItems:"center",
            background:"#D4AF37", borderRadius:"4px",
            padding:"6px 22px", marginBottom:"1.5rem",
          }}>
            {["FRESHI","·","LADHA","·","SAFI"].map((w,i) => (
              <span key={i} style={{
                color:"#06132E", fontFamily:"sans-serif",
                fontWeight: w==="·" ? 400 : 700,
                fontSize: w==="·" ? "13px" : "11px",
                letterSpacing: w==="·" ? 0 : "1.5px",
                opacity: w==="·" ? 0.4 : 1,
              }}>{w}</span>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", justifyContent:"center" }}>
            <a href="#menu" style={{
              background:"#D4AF37", color:"#06132E",
              borderRadius:"99px", padding:"12px 32px",
              fontFamily:"sans-serif", fontWeight:700, fontSize:"14px",
              textDecoration:"none", display:"inline-block",
              boxShadow:"0 4px 16px rgba(212,175,55,0.45)",
            }}>
              {lang === "sw" ? "Tazama Menyu" : "View Menu"} →
            </a>

            {/* FIX #8 — proper href fallback, onClick handles Android deep link */}
            <a
              href={waUrl}
              onClick={handleWA}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background:"#25d366", color:"#fff",
                borderRadius:"99px", padding:"12px 26px",
                fontFamily:"sans-serif", fontWeight:700, fontSize:"14px",
                display:"flex", alignItems:"center", gap:"7px",
                textDecoration:"none",
                boxShadow:"0 4px 16px rgba(37,211,102,0.35)",
              }}>
              <i className="ti ti-brand-whatsapp" style={{ fontSize:"18px" }} />
              WhatsApp Business
            </a>
          </div>
        </div>

        {/* Kanga stripe */}
        <div style={{
          height:"6px",
          background:"repeating-linear-gradient(45deg,#D4AF37 0,#D4AF37 7px,#06132E 7px,#06132E 14px)",
          position:"relative", zIndex:1,
        }} />
      </section>

      {/* ══ FOOD STRIP — moved BELOW hero, clean separation ══ */}
      <div style={{
        background:"#06132E",
        borderBottom:"2px solid rgba(212,175,55,0.3)",
        padding:"12px 8px",
        boxShadow:"0 4px 12px rgba(0,0,0,0.25)",
      }}>
        <div style={{
          display:"flex", gap:"7px", flexWrap:"wrap",
          justifyContent:"center", maxWidth:"880px", margin:"0 auto",
        }}>
          {FOODS.map((f,i) => (
            <div key={i} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:"3px",
              background:"rgba(253,245,228,0.08)",
              border:"1px solid rgba(212,175,55,0.28)",
              borderRadius:"10px", padding:"8px 10px", minWidth:"54px",
              cursor:"pointer",
              transition:"background 0.2s, transform 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(212,175,55,0.15)"; e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(253,245,228,0.08)"; e.currentTarget.style.transform="none"; }}
            >
              <span style={{ fontSize:"24px", lineHeight:1 }}>{f.e}</span>
              <span style={{ color:"rgba(212,175,55,0.88)", fontSize:"9px", fontFamily:"sans-serif", letterSpacing:"0.5px" }}>
                {f.n}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
