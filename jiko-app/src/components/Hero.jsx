import { business } from "../data/businessConfig";
import { useLang } from "../lang/LanguageContext";

// Food items shown in the hero strip — keeps it visual and authentic
const FOODS = [
  { e:"☕", n:"Chai" },  { e:"🍛", n:"Pilau" },  { e:"🍗", n:"Kuku" },
  { e:"🫕", n:"Wali" },  { e:"🍟", n:"Chips" },  { e:"🍲", n:"Kongoro" },
  { e:"🧃", n:"Juice" }, { e:"🫓", n:"Chapati" },{ e:"🍌", n:"Ndizi" },
];

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

  return (
    <section id="top" style={{ position: "relative", overflow: "hidden", minHeight: "520px" }}>

      {/* ── Kilimanjaro banner background ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url(/banner.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
        filter: "brightness(0.75)",
      }} />

      {/* Navy gradient overlay — keeps text readable */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(160deg, rgba(6,19,46,0.90) 0%, rgba(11,31,69,0.78) 55%, rgba(6,19,46,0.60) 100%)",
      }} />

      {/* ── Content ── */}
      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: "900px", margin: "0 auto",
        padding: "3rem 1.25rem 2rem",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      }}>

        {/* Heritage badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          border: "1px solid rgba(212,175,55,0.45)", borderRadius: "99px",
          padding: "4px 18px", marginBottom: "1.4rem",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4AF37", flexShrink: 0 }} />
          <span style={{ color: "#D4AF37", fontSize: "10px", fontFamily: "sans-serif", letterSpacing: "3px", fontWeight: 700 }}>
            KWA LADHA HALISI YA NYUMBANI
          </span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4AF37", flexShrink: 0 }} />
        </div>

        {/* Real logo — prominent */}
        <div style={{ position: "relative", marginBottom: "1.5rem" }}>
          {/* Decorative rings */}
          <div style={{ position: "absolute", inset: "-10px", borderRadius: "50%", border: "1px solid rgba(212,175,55,0.3)" }} />
          <div style={{ position: "absolute", inset: "-18px", borderRadius: "50%", border: "1px solid rgba(212,175,55,0.15)" }} />
          <img
            src="/logo.png"
            alt="Unyamwezini Jiko La Bibi JJJ"
            width={160} height={160}
            style={{ borderRadius: "50%", border: "3.5px solid #D4AF37", objectFit: "cover", display: "block" }}
            onError={e => { e.target.style.display = "none"; }}
          />
        </div>

        {/* Brand title */}
        <h1 style={{
          fontFamily: "Georgia, serif",
          fontSize: "clamp(28px, 6vw, 52px)",
          fontWeight: 900, lineHeight: 1.08,
          color: "#FDF5E4", margin: "0 0 8px",
        }}>
          Unyamwezini<br />
          <span style={{ color: "#D4AF37" }}>Jiko La Bibi JJJ</span>
        </h1>

        <p style={{
          fontFamily: "Georgia, serif",
          fontSize: "clamp(14px, 3vw, 20px)",
          fontStyle: "italic",
          color: "rgba(253,245,228,0.78)",
          margin: "0 0 1.4rem",
        }}>
          {lang === "sw" ? business.tagline_sw : business.tagline_en}
        </p>

        {/* FRESHI · LADHA · SAFI */}
        <div style={{
          display: "inline-flex", gap: "10px", alignItems: "center",
          background: "#D4AF37", borderRadius: "4px",
          padding: "6px 20px", marginBottom: "1.6rem",
        }}>
          {["FRESHI", "·", "LADHA", "·", "SAFI"].map((w, i) => (
            <span key={i} style={{
              color: "#06132E",
              fontFamily: "sans-serif",
              fontWeight: w === "·" ? 400 : 700,
              fontSize: w === "·" ? "12px" : "11px",
              letterSpacing: w === "·" ? 0 : "1.5px",
              opacity: w === "·" ? 0.5 : 1,
            }}>
              {w}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginBottom: "2rem" }}>
          <a href="#menu" style={{
            background: "#D4AF37", color: "#06132E",
            borderRadius: "99px", padding: "11px 30px",
            fontFamily: "sans-serif", fontWeight: 700, fontSize: "14px",
            textDecoration: "none", display: "inline-block",
          }}>
            {lang === "sw" ? "Tazama Menyu" : "View Menu"} →
          </a>
          <button onClick={handleWA} style={{
            background: "#25d366", color: "#fff",
            border: "none", borderRadius: "99px", padding: "11px 24px",
            fontFamily: "sans-serif", fontWeight: 700, fontSize: "14px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "7px",
          }}>
            <i className="ti ti-brand-whatsapp" style={{ fontSize: "18px" }} aria-hidden="true" />
            WhatsApp Business
          </button>
        </div>

        {/* Food strip — bottom of hero */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
          {FOODS.map((f, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
              background: "rgba(253,245,228,0.10)",
              border: "1px solid rgba(212,175,55,0.30)",
              borderRadius: "10px", padding: "8px 10px",
              minWidth: "52px",
            }}>
              <span style={{ fontSize: "24px", lineHeight: 1 }}>{f.e}</span>
              <span style={{ color: "rgba(212,175,55,0.85)", fontSize: "9px", fontFamily: "sans-serif", letterSpacing: "0.5px" }}>
                {f.n}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Kanga stripe at bottom */}
      <div style={{
        height: "6px",
        background: "repeating-linear-gradient(45deg, #D4AF37 0, #D4AF37 7px, #06132E 7px, #06132E 14px)",
        position: "relative", zIndex: 1,
      }} />
    </section>
  );
}
